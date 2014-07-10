var marked = require('marked');

module.exports = function(options) {
  if (!options) options = {}
  return render.bind(null, options);
}



function render(options, ractive, read, chapter, key, done) {

  if (!options) options = {};
  if (!options.ractive_key) options.ractive_key = 'content';

  read.as_string(chapter, 'README.md', key, function(err, md){

    var image_post_process = [];
    var renderer = new marked.Renderer();
    renderer.image = function (href, title, text) {
      var img = read.find(chapter, href)
      if (img) {
        image_post_process.push(img);
        if (!key) return '<img id="'+ img.id +'" src="file/'+ img.id +'" title="' + title + '" alt="' + text + '" />';
        else      return '<img id="'+ img.id +'" src="" title="' + title + '" alt="' + text + '" />';
      }
      else return '<img src="'+ href +'" title="' + title + '" />';
    }
    ractive.set(options.ractive_key, marked(md, { renderer: renderer }));
    markdown_image_replace(read, chapter, image_post_process, key);
    done()

  })

}

function markdown_image_replace(read, chapter, images, key) {

    images.forEach(function(image){

      if (window.URL && window.URL.createObjectURL) {
        read.as_blob(chapter, image, key, function(err, blob){
          var url = window.URL.createObjectURL(blob);
          var $img = document.getElementById(image.id);
          $img.src = url;

        })
      } else {
        read.as_data_url(chapter, image, key, function(err, url){
          document.getElementById(image.id).src = url;
        })
      }
    })
}