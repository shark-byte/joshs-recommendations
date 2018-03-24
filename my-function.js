function generateRandomData(context, _, done){  
  const min = 0;
  const max = 10000000;
  const rand = Math.round(min + Math.random()*(max - min));

  context.vars.id = rand;

  return done();
}


module.exports = {
  generateRandomData
};