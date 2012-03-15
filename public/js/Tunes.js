'use strict';

(function(window) {

  var tunesApp = angular.module('tunesApp', []);

  // // app with fake backend (uncoment if you want to use it)
  // var tunesAppFake = angular.module('tunesAppFake', ['tunesApp', 'ngMockE2E']);
  // tunesAppFake.run(function($httpBackend) {
  //   $httpBackend.whenGET(/templates\/.*/).passThrough();
  //   $httpBackend.whenGET('albums.json').respond([
  //     {
  //       "title": "test album",
  //       "artist": "test artist",
  //       "tracks": [
  //         {
  //           "title": "test track 1",
  //           "url": "music/blue.mp3"
  //         },
  //         {
  //           "title": "test track 2",
  //           "url": "music/jazz.mp3"
  //         }
  //       ]
  //     }
  //   ]);
  // });

  window.TunesCtrl = function($scope, $http, player) {
    $scope.player = player;
    $http.get('albums.json').success(function(data) {
      $scope.albums = data;
    });
  };


  tunesApp.factory('player', function(audio, $rootScope) {
    var player,
        playlist = [],
        paused = false,
        current = {
          album: 0,
          track: 0
        };

    player = {
      playlist: playlist,

      current: current,

      playing: false,

      play: function(track, album) {
        if (!playlist.length) return;

        if (angular.isDefined(track)) current.track = track;
        if (angular.isDefined(album)) current.album = album;

        if (!paused) audio.src = playlist[current.album].tracks[current.track].url;
        audio.play();
        player.playing = true;
        paused = false;
      },

      pause: function() {
        if (player.playing) {
          audio.pause();
          player.playing = false;
          paused = true;
        }
      },

      reset: function() {
        player.pause();
        current.album = 0;
        current.track = 0;
      },

      next: function() {
        if (!playlist.length) return;
        paused = false;
        if (playlist[current.album].tracks.length > (current.track + 1)) {
          current.track++;
        } else {
          current.track = 0;
          current.album = (current.album + 1) % playlist.length;
        }
        if (player.playing) player.play();
      },

      previous: function() {
        if (!playlist.length) return;
        paused = false;
        if (current.track > 0) {
          current.track--;
        } else {
          current.album = (current.album - 1 + playlist.length) % playlist.length;
          current.track = playlist[current.album].tracks.length - 1;
        }
        if (player.playing) player.play();
      }
    };

    playlist.add = function(album) {
      if (playlist.indexOf(album) != -1) return;
      playlist.push(album);
    };

    playlist.remove = function(album) {
      var index = playlist.indexOf(album);
      if (index == current.album) player.reset();
      playlist.splice(index, 1);
    };

    audio.addEventListener('ended', function() {
      $rootScope.$apply(player.next);
    }, false);

    return player;
  });


  // extract the audio for making the player easier to test
  tunesApp.factory('audio', function($document) {
    var audio = $document[0].createElement('audio');
    return audio;
  });

})(window);