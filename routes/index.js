
// GET home page.
exports.index = function(req, res){
  res.render('index');
};

// GET new test form.
exports.create = function(req, res){
  res.render('new_test');
};

// POST test form.
exports.run_test = function(req, res){
  var link = req.body.link;
  var file = req.body.file;

  console.log(link);
  console.log(file);

  res.render('show_test', { link: link, file: file });
};
