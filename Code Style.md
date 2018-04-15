# 代码规范
> First off, I'd suggest printing out a copy of the GNU coding standards, and NOT read it. Burn them, it's a great symbolic gesture.



## 使用ES2016+

JavaScript规范使用[ES2016+](http://kangax.github.io/compat-table/es2016plus/)



## 使用ESLint

代码使用[ESlint](http://eslint.cn/)作为基本的语法检验工具，规则如下：

- [Eslint Config Standard](https://github.com/standard/eslint-config-standard) 作为基础规则
- [semi](https://eslint.org/docs/rules/semi) 使用分号
- [space-before-function-paren](https://eslint.org/docs/rules/space-before-function-paren) 函数参数列表前需要有括号
- [object-curly-spacing](https://eslint.org/docs/rules/object-curly-spacing) 对象花括号中必须有空格
- [arrow-parens](https://eslint.org/docs/rules/arrow-parens) 箭头函数参数列表按需添加括号
- [no-console](https://eslint.org/docs/rules/no-console) 不适用console
- [camelcase](https://eslint.org/docs/rules/camelcase) 允许非驼峰式命名