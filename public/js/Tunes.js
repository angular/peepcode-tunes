'use strict;'

TunesCtrl.$inject = ['$xhr', 'player']
function TunesCtrl($xhr, player) {
  var scope = this;

  scope.player = player;

  $xhr('GET', '/albums', function(statusCode, body) {
    scope.albums = body;
  });
}


angular.service('player', function(audio) {
  var player,
      playlist = [],
      paused = false,
      current = {
        album: 0,
        track: 0
      },
      scope = this;

  player = {
    playlist: playlist,

    current: current,

    playing: false,

    play: function() {
      if (!playlist.length) return;
      if (!paused) audio.src = playlist[current.album].tracks[current.track].url;
      audio.play();
      player.playing = true;
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
        if (playlist.length > (current.album + 1)) {
          current.album++;
        } else {
          current.album = 0;
        }
        current.track = 0;
      }
      if (player.playing) player.play();
    },

    previous: function() {
      if (!playlist.length) return;
      paused = false;
      if (current.track > 0) {
        current.track--;
      } else {
        if (current.album > 0) {
          current.album--;
        } else {
          current.album = playlist.length - 1;
        }
        current.track = playlist[current.album].tracks.length - 1;
      }
      if (player.playing) player.play();
    }
  };

  playlist.add = function(album) {
    if (angular.Array.indexOf(playlist, album) != -1) return;
    playlist.push(album);
  }

  playlist.remove = function(album) {
    if (angular.Array.indexOf(playlist, album) == current.album) player.reset();
    angular.Array.remove(playlist, album);
  }

  audio.addEventListener('ended', function() {
    scope.$apply(player.next);
  }, false);

  return player;
});


// extract the audio for making the player easier to test
angular.service('audio', function($document) {
  var audio = $document[0].createElement('audio');
  return audio;
});
