var albumData = [{
    "title":  "Album A",
    "artist": "Artist A",
    "tracks": [
        {
            "title": "Track A",
            "url": "/music/Album A Track A.mp3"
        },
        {
            "title": "Track B",
            "url": "/music/Album A Track B.mp3"
        }]
}, {
    "title": "Album B",
    "artist": "Artist B",
    "tracks": [
        {
            "title": "Track A",
            "url": "/music/Album B Track A.mp3"
        },
        {
            "title": "Track B",
            "url": "/music/Album B Track B.mp3"
    }]
}];


beforeEach(module('tunesApp'));

describe('TunesCtrl', function() {

  it('should initialize the scope for the view', inject(function($rootScope, $httpBackend, $controller) {
    var ctrlScope;

    $httpBackend.expectGET('albums.json').respond(albumData);
    ctrlScope = $rootScope.$new();
    $controller(TunesCtrl, {$scope: ctrlScope});

    expect(ctrlScope.player.playlist.length).toBe(0);
    expect(ctrlScope.albums).toBeUndefined();

    $httpBackend.flush();

    expect(ctrlScope.albums).toBe(albumData);
  }));
});


describe('player service', function() {
  var player,
      audioMock;


  beforeEach(module(function($provide) {
    audioMock = {
      play: jasmine.createSpy('play'),
      pause: jasmine.createSpy('pause'),
      src: undefined,
      addEventListener: jasmine.createSpy('addEventListener').andCallFake(
          function(event, fn, capture) {
        expect(event).toBe('ended');
        expect(capture).toBe(false);
        audioMock.endedFn = fn;
      })
    }
    $provide.value('audio', audioMock);
  }));
  

  beforeEach(inject(function($injector) {
    player = $injector.get('player');
  }));


  it('should initialize the player', function() {
    expect(player.playlist.length).toBe(0);
    expect(player.playing).toBe(false);
    expect(player.current).toEqual({album: 0, track: 0});
  });


  it('should register an ended event listener on adio', function() {
    expect(audioMock.addEventListener).toHaveBeenCalled();
  });


  it('should call player.next() when the ended event fires', function() {
    player.playlist.add(albumData[0]);
    player.play();
    expect(audioMock.src).toBe("/music/Album A Track A.mp3");
    audioMock.endedFn();
    expect(audioMock.src).toBe("/music/Album A Track B.mp3");
  });


  describe('play', function() {

    it('should not do anything if playlist is empty', function() {
      player.play();
      expect(player.playing).toBe(false);
      expect(audioMock.play).not.toHaveBeenCalled();
    });


    it('should play the currently selected song', function() {
      player.playlist.add(albumData[0]);
      player.play();
      expect(player.playing).toBe(true);
      expect(audioMock.play).toHaveBeenCalled();
      expect(audioMock.src).toBe("/music/Album A Track A.mp3");
    });


    it('should resume playing a song after paused', function() {
      player.playlist.add(albumData[0]);
      player.play();
      player.pause();
      audioMock.play.reset();
      audioMock.src = 'test'; // player must not touch the src property when resuming play
      player.play();
      expect(player.playing).toBe(true);
      expect(audioMock.play).toHaveBeenCalled();
      expect(audioMock.src).toBe('test');
    });
  });


  describe('pause', function() {

    it('should not do anything if player is not playing', function() {
      player.pause();
      expect(player.playing).toBe(false);
      expect(audioMock.pause).not.toHaveBeenCalled();
    });

    it('should pause the player when playing', function() {
      player.playlist.add(albumData[0]);
      player.play();
      expect(player.playing).toBe(true);
      player.pause();
      expect(player.playing).toBe(false);
      expect(audioMock.pause).toHaveBeenCalled();
    });
  });


  describe('reset', function() {

    it('should stop currently playing song and reset the internal state', function() {
      player.playlist.add(albumData[0]);
      player.current.track = 1;
      player.play();
      expect(player.playing).toBe(true);

      player.reset();
      expect(player.playing).toBe(false);
      expect(audioMock.pause).toHaveBeenCalled();
      expect(player.current).toEqual({album: 0, track: 0});
    });
  });


  describe('next', function() {

    it('should do nothing if playlist is empty', function() {
      player.next();
      expect(player.current).toEqual({album: 0, track: 0});
    });

    it('should advance to the next song in the album', function() {
      player.playlist.add(albumData[0]);
      player.next();
      expect(player.current).toEqual({album: 0, track: 1});
    });

    it('should wrap around when on last song and there is just one album in playlist', function() {
      player.playlist.add(albumData[0]);
      player.next();
      player.next();
      expect(player.current).toEqual({album: 0, track: 0});
    });

    it('should wrap around when on last song and there are multiple albums in playlist', function() {
      player.playlist.add(albumData[0]);
      player.playlist.add(albumData[1]);
      player.current.album = 1;
      player.current.track = 1;
      player.next();
      expect(player.current).toEqual({album: 0, track: 0});
    });

    it('should start playing the next song if currently playing', function() {
      player.playlist.add(albumData[0]);
      player.play();
      audioMock.play.reset();
      player.next();
      expect(player.playing).toBe(true);
      expect(audioMock.play).toHaveBeenCalled();
      expect(audioMock.src).toBe('/music/Album A Track B.mp3');
    });
  });


  describe('previous', function() {

    it('should do nothing if playlist is empty', function() {
      player.previous();
      expect(player.current).toEqual({album: 0, track: 0});
    });

    it('should move to the previous song in the album', function() {
      player.playlist.add(albumData[0]);
      player.next();
      player.previous();
      expect(player.current).toEqual({album: 0, track: 0});
    });

    it('should wrap around when on first song and there is just one album in playlist', function() {
      player.playlist.add(albumData[0]);
      player.previous();
      expect(player.current).toEqual({album: 0, track: 1});
    });

    it('should wrap around when on first song and there are multiple albums in playlist', function() {
      player.playlist.add(albumData[0]);
      player.playlist.add(albumData[1]);
      player.previous();
      expect(player.current).toEqual({album: 1, track: 1});
    });

    it('should start playing the next song if currently playing', function() {
      player.playlist.add(albumData[0]);
      player.play();
      audioMock.play.reset();
      player.previous();
      expect(player.playing).toBe(true);
      expect(audioMock.play).toHaveBeenCalled();
      expect(audioMock.src).toBe('/music/Album A Track B.mp3');
    });
  });


  describe('playlist', function() {

    it('should be a simple array', function() {
      expect(player.playlist.constructor).toBe([].constructor);
    });


    describe('add', function() {

      it("should add an album to the playlist if it's not present there already", function() {
        expect(player.playlist.length).toBe(0);
        player.playlist.add(albumData[0]);
        expect(player.playlist.length).toBe(1);
        player.playlist.add(albumData[1]);
        expect(player.playlist.length).toBe(2);
        player.playlist.add(albumData[0]);
        expect(player.playlist.length).toBe(2); // nothing happened, already there
      });
    });


    describe('remove', function() {

      it('should remove an album from the playlist if present', function() {
        player.playlist.add(albumData[0]);
        player.playlist.add(albumData[1]);
        expect(player.playlist.length).toBe(2);

        player.playlist.remove(albumData[0]);
        expect(player.playlist.length).toBe(1);
        expect(player.playlist[0].title).toBe('Album B');

        player.playlist.remove(albumData[1]);
        expect(player.playlist.length).toBe(0);

        player.playlist.remove(albumData[0]); // nothing happend, not in the playlist
        expect(player.playlist.length).toBe(0);
      });
    });
  });
});


describe('audio service', function() {

  it('should create and return html5 audio element', inject(function(audio) {
    expect(audio.nodeName).toBe('AUDIO');
  }));
});