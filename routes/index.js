
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

  var fs = require('fs');
  var pngparse = require("pngparse");
  var phantom= require('node-phantom');
  var PNG = require('pngjs').PNG;

  fs.createReadStream('/Users/ericcook/Dropbox/Fullstack/MyPrograms/imagecompare/puppy1.png')
      .pipe(new PNG({
          filterType: 4
      }))
      .on('parsed', function() {
      var data1 = this;
      fs.createReadStream('/Users/ericcook/Dropbox/Fullstack/MyPrograms/imagecompare/puppy2.png')
      .pipe(new PNG({
          filterType: 4
    }))
      .on('parsed', function() {
      var data2 = this;
      var totalPixels = data1.height * data1.width;
      console.log(data1.height + "," + data1.width);

      var differenceCount = 0;
          for (var y = 0; y < data1.height; y++) {
              for (var x = 0; x < data1.width; x++) {
                  var idx = (data1.width * y + x) << 2;

      // if(data2.data[idx] === 255 && data2.data[idx+1] === 255 && data2.data[idx+2] === 255){
      // data2.data[idx] = 1;
              //    data2.data[idx+1] = 1;
              //    data2.data[idx+2] = 1;
      // }

      if((data1.data[idx] !== data2.data[idx] || data1.data[idx+1] !== data2.data[idx+1] || data1.data[idx+2] !== data2.data[idx+2])){
      differenceCount++;
                data2.data[idx] =  data2.data[idx] + 255
                  data2.data[idx+1] = 255 - data2.data[idx+1];
                  data2.data[idx+2] = 255 - data2.data[idx+2];
                  }
              }
          }

      var results = "These pictures " + ((1 - (differenceCount/totalPixels)) *100) + "% the same";
      console.log("These pictures " + ((1 - (differenceCount/totalPixels)) *100) + "% the same")

      this.pack().pipe(fs.createWriteStream('out.png'));
      });
    });


  res.render('show_test', { link: link, file: file, message: message });
};

