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
import rule = require("../../src/rules/no-same-line-conditional");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018, sourceType: "module" } });

ruleTester.run("Conditionals should start on new lines", rule, {
  valid: [
    {
      code: `
      if (cond1)
        if (cond2) {
          if (cond3) {
          }
        }`,
    },
    {
      code: `
      if (cond1) {
      } else if (cond2) {
      } else if (cond3) {
      }`,
    },
    {
      code: `
      if (cond1) {
      }
      if (cond2) {
      } else if (cond3) {
      }`,
    },
    {
      code: `
      if (cond1)
        doSomething();
      if (cond2) {
      }`,
    },
    {
      code: `foo(); if (cond) bar();`,
    },
    {
      // OK if everything is on one line
      code: `if (cond1) foo(); if (cond2) bar();`,
    },
    {
      code: `
      function myFunc() {
        if (cond1) {
        } else if (cond2) {
        } else if (cond3) {
        }
      }`,
    },
    {
      code: `
      switch(x) {
        case 1:
          if (cond1) {
          } else if (cond2) {
          } else if (cond3) {
          }
          break;
        default:
          if (cond1) {
          } else if (cond2) {
          } else if (cond3) {
          }
          break;
      }`,
    },
  ],
  invalid: [
    {
      code: `
      if (cond1) {
      } if (cond2) {
      }`,
      errors: [
        {
          message:
            '{"message":"Move this \\"if\\" to a new line or add the missing \\"else\\".","secondaryLocations":[{"column":6,"line":3,"endColumn":7,"endLine":3}]}',
          line: 3,
          endLine: 3,
          column: 9,
          endColumn: 11,
        },
      ],
    },
    {
      code: `
      switch(x) {
        case 1:
          if (cond1) {
          } else if (cond2) {
          } if (cond3) {
          }
          break;
        default:
          if (cond1) {
          } if (cond2) {
          } else if (cond3) {
          }
          break;
      }`,
      errors: [
        {
          message:
            '{"message":"Move this \\"if\\" to a new line or add the missing \\"else\\".","secondaryLocations":[{"column":10,"line":6,"endColumn":11,"endLine":6}]}',
          line: 6,
          endLine: 6,
          column: 13,
          endColumn: 15,
        },
        {
          message:
            '{"message":"Move this \\"if\\" to a new line or add the missing \\"else\\".","secondaryLocations":[{"column":10,"line":11,"endColumn":11,"endLine":11}]}',
          line: 11,
          endLine: 11,
          column: 13,
          endColumn: 15,
        },
      ],
    },
    {
      code: `
      if (cond1) {
      } else if (cond2) {
      } if (cond3) {
      }`,
      errors: [
        {
          message:
            '{"message":"Move this \\"if\\" to a new line or add the missing \\"else\\".","secondaryLocations":[{"column":6,"line":4,"endColumn":7,"endLine":4}]}',
        },
      ],
    },
    {
      code: `
      if (cond1)
        if (cond2) {
          if (cond3) {
          } if (cond4) {
          }
        }`,
      errors: [
        {
          message:
            '{"message":"Move this \\"if\\" to a new line or add the missing \\"else\\".","secondaryLocations":[{"column":10,"line":5,"endColumn":11,"endLine":5}]}',
        },
      ],
    },
    {
      code: `
      function myFunc() {
        if (cond1) {
        } else if (cond2) {
        } if (cond3) {
        }
      }`,
      errors: [
        {
          message:
            '{"message":"Move this \\"if\\" to a new line or add the missing \\"else\\".","secondaryLocations":[{"column":8,"line":5,"endColumn":9,"endLine":5}]}',
        },
      ],
    },
  ],
});
