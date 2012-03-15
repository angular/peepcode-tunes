# <del>Backbone Tunes: A backbone.js demo</del>
# Angular Tunes: An AngularJS demo

- Displays a list of available albums and their tracks
- Allows queueing albums for playback
- Plays the queue, one track at a time

Live Demo: <http://angular.github.com/peepcode-tunes/public/>


## Rewrite notes

Have you seen any of the awesome [Peepcode screencasts](http://peepcode.com/)? They are well done.
When I saw that they started [a series on Backbone.js](http://peepcode.com/products/backbone-ii), I
went ahead and bought the available episodes and watched them.

And then it happened... I realized that while the screencast was very well done, and the app was
quite nice, the code could use several improvements. The biggest one being - this app could be much
simpler if it was written in [AngularJS](http://angularjs.org). So I sat down and rewrote most of
the code in 2-3 hours.

I expected the rewrite to be simpler, but **I didn't expect to delete about 2/3 of the codebase**
(see [diff]).

I didn't spend too much time thinking about how the backbone code could be improved, so if you can
write the app with backbone in a significantly better way, I'd be very happy to look over your fork!

Anyway, as I was rewriting the app I came to these conclusions about the Backbone app and Backbone
itself:

- **There is just way too much wiring going on.**

  I think that this is an artifact of backbone being agnostic of templating and very heavily focused
  on the model. This means that the burden of keeping the view updated with using the right
  templates updated in the right places at the right time is up to the developer.

  If you look at the diff, you'll notice that I deleted all of the views and replaced them with
  nothing. This stuff is not necessary in Angular. Angular looks at the template and figures out
  how the view should be updated with what kind of dom manipulation, when, and with what data.

- **Template fragmentation.**

  Templates in the original backbone app were split into several tiny fragments. Because of this a
  web designer would have a hard time figuring out how the templates end up being composed in the
  final view. To make matters even worse, the template fragments in `index.html` were not complete,
  since before combining all templates into the final view each of the fragment is wrapped into a
  dom element with some css class and this information is in the javascript code.

  Now you might think that this is not a big deal for some reason, but this kind of fragmentation
  results in creating a messy DOM tree with some non-obvious errors. For example in the original
  backbone app, `div` elements are being nested in the `ul` container, instead of proper use of
  `li`s. This kind of stuff is hard to spot with fragmented templates, unless you inspect the DOM
  in the browser.

- **Models are unnecessary complicated.**

  Backbone is all about rich models and that's great, but I think that the original code was
  overdoing it. I'm not sure if that's because of backbone's deficiencies or because the code was
  not designed well. For instance, for the playlist, in the angular version I'm simply using a plain
  old javascript array, instead of a fancy object. Simple is better IMO because less code means
  less code to test and maintain!

- **Dependencies, dependencies, dependencies.**

  Even a trivial app like this one, requires including underscore and jquery libraries to get stuff
  done. jQuery (minified) alone is much bigger (31KB) than backbone and the app code combined.
  AngularJS is just 25KB (min+gzip) and doesn't *require* jQuery or underscore.


If you feel that any of these points are wrong, feel free to fork the code, improve the backbone
version and prove your argument with a diff.


### Features and Fixes

The original app contains several bugs and missing features that I fixed/added:

- next/previous buttons don't throw exceptions when pressed while playlist is empty
- pressing play when playlist is empty doesn't do anything
- when playlist is emptied, play button doesn't start to play the last played song
- when one song finishes playing, the next one in the playlist starts
- the DOM contains fewer elements and I fixed issues like nesting `div`s inside of `ul`s
- conditional css and Modernizr were removed since they are not being utilized by the app


## USAGE

### Run:

    rake server
or

    node server.js

Visit the webserver at:

    http://localhost:9292


### Test:

open `test-js/SpecRunner.html` in your browser (using the file:// protocol)


## License

All my code as well as AngularJS are licensed under the [MIT license]. The license of the original
code from PeepCode is unknown, but I got their OK to fork and publish it: http://goo.gl/UB36U

[diff]: https://github.com/angular/peepcode-tunes/commit/87dfa695d9981b1fc439c6cf4ed32f77970faf8f
[MIT license]: https://github.com/angular/angular.js/blob/master/LICENSE
