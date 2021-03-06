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
import { RuleTester } from "eslint";
import rule = require("../../src/rules/prefer-while");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
const message = 'Replace this "for" loop with a "while" loop.';

ruleTester.run("prefer-while", rule, {
  valid: [
    { code: "for(var i = 0; condition;) { }" },
    { code: "for(var i = 0; condition; i++) { }" },
    { code: "for(var i = 0;; i++) { }" },
    { code: "for (i; condition; ) { }" },
    { code: "for ( ; i < length; i++ ) { }" },
    { code: "while (i < length) { }" },
    { code: "for (a in b) { }" },
    { code: "for (a of b) { }" },
  ],
  invalid: [
    {
      code: "for(;condition;) {}",
      errors: [{ message, line: 1, column: 1, endColumn: 4 }],
      output: "while (condition) {}",
    },
    {
      code: "for (;condition; ) foo();",
      errors: [{ message }],
      output: "while (condition) foo();",
    },
    {
      code: `
        for(;i < 10;)
          doSomething();`,
      errors: [{ message }],
      output: `
        while (i < 10)
          doSomething();`,
    },
    {
      code: "for(;;) {}",
      errors: [{ message }],
      output: "for(;;) {}", // no fix
    },
  ],
});
