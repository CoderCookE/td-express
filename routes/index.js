var fs = require('fs');
var pngparse = require("pngparse");
var phantom= require('node-phantom');
var PNG = require('pngjs').PNG;
var AWS = require('aws-sdk');
var webshot = require('webshot');
var request = require('request');
var os = require('os');
var ostemp = os.tmpdir();

// move to proper config file
AWS.config.update({accessKeyId: "AKIAJNM4N33ZSXQ4Q7TQ", secretAccessKey: "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"});

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

	// temporary id number generator
	var testid = new Date().valueOf();

	// set screenshot file name
	var screenshotName = testid + '-ss.png';

	var link = req.body.link;
	var file = req.files.file;

	var filePath = file.path;

	// change user file name to test id
	var fileRename = file.name.split('.');
	fileRename[0] = testid;
	file.name = fileRename.join('.');

	var linkUrl = 'http://s3.amazonaws.com/screenshotsfp/' + screenshotName;
	var fileUrl = 'http://s3.amazonaws.com/screenshotsfp/' + file.name;

	// upload user file to s3
	fs.readFile(filePath, function(err, data) {
		if (err) { throw err; }
		var s3 = new AWS.S3({ params: {Bucket: 'screenshotsfp', Key: file.name }});
		s3.putObject({
			Body: data
		}, function() {
			console.log('UPLOADED');

				// upload screenshot to s3
	webshot(link, ostemp + screenshotName, function(err) {
		fs.readFile(ostemp + screenshotName, function(err, data) {
			if (err) { throw err; }
			var s3 = new AWS.S3({ params: {Bucket: 'screenshotsfp', Key: screenshotName }});
			s3.putObject({
				Body: data
			}, function() {
				console.log('UPLOADED');
				runTests(linkUrl, fileUrl, testid, res);

			});
		});
	});

		});
	});
};

var runTests = function(linkURL, fileURL,testid,res){
	request.get({url: fileURL, encoding: 'binary'}, function(err, response, body){
		fs.writeFile(os.tmpdir()+'/image.png', body, 'binary', function(err){
			fs.createReadStream(os.tmpdir()+'/image.png')
	    .pipe(new PNG({
	        filterType: 4
	    }))
	    .on('parsed', function() {
	    	var data1 = this;
	    	request.get({url: linkURL, encoding: 'binary'}, function(err, response, body){
					fs.writeFile(os.tmpdir()+'/image2.png', body, 'binary', function(err){
		    	fs.createReadStream(os.tmpdir()+'/image2.png')
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
		     						if((data1.data[idx] !== data2.data[idx] || data1.data[idx+1] !== data2.data[idx+1] || data1.data[idx+2] !== data2.data[idx+2])){
		     								differenceCount++;
		               			data2.data[idx] =  data2.data[idx] + 255;
		                		data2.data[idx+1] = 255 - data2.data[idx+1];
		                		data2.data[idx+2] = 255 - data2.data[idx+2];
		                }
		            }
		        }
						console.log("These pictures " + ((1 - (differenceCount/totalPixels)) *100) + "% the same")


						var r = this.pack().pipe(fs.createWriteStream(os.tmpdir()+'out.png'));

						r.on('close', function(){
								fs.readFile(os.tmpdir()+'out.png', function(err, data) {
								if (err) { throw err; }
								var s3 = new AWS.S3({ params: {Bucket: 'screenshotsfp', Key: testid+'-out.png' }});
								s3.putObject({
									Body: data
								}, function() {
									console.log('UPLOADED');

							var percentage = ((1 - (differenceCount/totalPixels)) *100);
							res.render('show_test', { linkUrl: linkURL, fileUrl: fileURL, percentage: percentage, outUrl:'http://s3.amazonaws.com/screenshotsfp/'+ testid +'-out.png'});
									});
							});
						})


						});
					});
	    	});
	    });
		})
	})
}
