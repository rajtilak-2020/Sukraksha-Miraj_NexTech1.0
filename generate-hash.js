import bcrypt from 'bcryptjs';

const password = 'nextechad1';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log('Generated hash:', hash);