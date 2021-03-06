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
import rule = require("../../src/rules/no-useless-catch");

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 10 },
});

ruleTester.run("no-useless-catch", rule, {
  valid: [
    { code: `try {} catch (e) {}` },
    { code: `try {} catch { throw "Error"; }` },
    {
      code: `try {} catch (e) {
              foo();
              throw e;
            }`,
    },
    {
      code: `try {} catch({ message }) {
        throw { message }; // OK, not useless, we might ignore other properties of exception
      }`,
    },
    {
      code: `try {} catch (e) {
              if (x) {
                throw e;
              }
            }`,
    },
    {
      code: `try {} catch(e) { throw "foo"; }`,
    },
    {
      code: `try {} catch(e) { throw new Error("improve error message"); }`,
    },
  ],
  invalid: [
    {
      code: `try {} catch (e) { throw e; }`,
      errors: [
        {
          message: "Add logic to this catch clause or eliminate it and rethrow the exception automatically.",
          line: 1,
          endLine: 1,
          column: 8,
          endColumn: 13,
        },
      ],
    },
    {
      code: `try {} catch(e) {
        // some comment
        throw e;
      }`,
      errors: 1,
    },
    {
      code: `try {
        doSomething();
      } catch(e) {
        throw e;
      } finally {
        // ...
      }`,
      errors: 1,
    },
  ],
});
