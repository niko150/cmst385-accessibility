const Classes = {
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
}

export default Classes