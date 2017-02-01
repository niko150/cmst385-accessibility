'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Classes = {
  name: 'Classes',
  schema: {
    department: '',
    number: '',
    title: '',
    description: '',
    url: '', // optional
    prerequisites: [], // optional nested, default record: {department, number}
    recommended: [], // optional nested
    equivalencies: [] // optional nested
  }
};

exports.default = Classes;