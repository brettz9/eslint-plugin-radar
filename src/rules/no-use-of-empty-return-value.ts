/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation,
 * version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */
// https://jira.sonarsource.com/browse/RSPEC-3699

import { Rule } from "eslint";
import { Node, CallExpression, Function, ReturnStatement, Identifier, ArrowFunctionExpression } from "estree";
import { isFunctionExpression, isArrowFunctionExpression, isBlockStatement, getParent } from "../utils/nodes";

function isReturnValueUsed(callExpr: Node, context: Rule.RuleContext) {
  const parent = getParent(context);
  if (!parent) {
    return false;
  }

  if (parent.type === "LogicalExpression") {
    return parent.left === callExpr;
  }

  if (parent.type === "SequenceExpression") {
    return parent.expressions[parent.expressions.length - 1] === callExpr;
  }

  if (parent.type === "ConditionalExpression") {
    return parent.test === callExpr;
  }

  return (
    parent.type !== "ExpressionStatement" &&
    parent.type !== "ArrowFunctionExpression" &&
    parent.type !== "UnaryExpression" &&
    parent.type !== "AwaitExpression" &&
    parent.type !== "ReturnStatement" &&
    parent.type !== "ThrowStatement"
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "The output of functions that don't return anything should not be used",
      category: "Bug Detection",
      recommended: true,
      url: "https://github.com/es-joy/eslint-plugin-radar/blob/master/docs/rules/no-use-of-empty-return-value.md",
    },
  },
  create(context: Rule.RuleContext) {
    const callExpressionsToCheck: Map<Identifier, Function> = new Map();
    const functionsWithReturnValue: Set<Function> = new Set();

    return {
      CallExpression(node: Node) {
        const callExpr = node as CallExpression;
        if (!isReturnValueUsed(callExpr, context)) {
          return;
        }
        const scope = context.getScope();
        const reference = scope.references.find((ref) => ref.identifier === callExpr.callee);
        if (reference && reference.resolved) {
          const variable = reference.resolved;
          if (variable.defs.length === 1) {
            const definition = variable.defs[0];
            if (definition.type === "FunctionName") {
              callExpressionsToCheck.set(reference.identifier, definition.node);
            } else if (definition.type === "Variable") {
              const { init } = definition.node;
              if (init && (isFunctionExpression(init) || isArrowFunctionExpression(init))) {
                callExpressionsToCheck.set(reference.identifier, init);
              }
            }
          }
        }
      },

      ReturnStatement(node: Node) {
        const returnStmt = node as ReturnStatement;
        if (returnStmt.argument) {
          const ancestors = [...context.getAncestors()].reverse();
          const functionNode = ancestors.find(
            (node) =>
              node.type === "FunctionExpression" ||
              node.type === "FunctionDeclaration" ||
              node.type === "ArrowFunctionExpression",
          );

          functionsWithReturnValue.add(functionNode as Function);
        }
      },

      ArrowFunctionExpression(node: Node) {
        const arrowFunc = node as ArrowFunctionExpression;
        if (arrowFunc.expression) {
          functionsWithReturnValue.add(arrowFunc);
        }
      },

      ":function"(node: Node) {
        const func = node as Function;
        if (func.async || func.generator || (isBlockStatement(func.body) && func.body.body.length === 0)) {
          functionsWithReturnValue.add(func);
        }
      },

      "Program:exit"() {
        callExpressionsToCheck.forEach((functionDeclaration, callee) => {
          if (!functionsWithReturnValue.has(functionDeclaration)) {
            context.report({
              message: `Remove this use of the output from "{{name}}"; "{{name}}" doesn't return anything.`,
              node: callee,
              data: { name: callee.name },
            });
          }
        });
      },
    };
  },
};

export = rule;
