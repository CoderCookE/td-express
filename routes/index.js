
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.create = function(req, res){
  res.render('new_test');
};

exports.run_test = function(req, res){
  res.send(200);
}