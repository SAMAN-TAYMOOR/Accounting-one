const name = { greet() { return 'hi'; } };
const obj = Object.create(name);
obj.greet();
document.write(obj.greet())