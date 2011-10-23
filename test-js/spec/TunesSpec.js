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

describe("Album", function () {

    beforeEach(function () {
        this.album = new Album(albumData[0]);
    });

    it("creates from data", function () {
        expect(this.album.get('tracks').length).toEqual(2);
    });

    describe("first track", function () {

        it("returns true for first track", function () {
            expect(this.album.isFirstTrack(0)).toBeTruthy();
        });

        it("returns false for other tracks", function () {
            expect(this.album.isFirstTrack(12)).toBeFalsy();
        });

    });

    describe("last track", function () {

        it("returns true for last track", function () {
            expect(this.album.isLastTrack(1)).toBeTruthy();
        });

        it("returns false for other tracks", function () {
            expect(this.album.isLastTrack(0)).toBeFalsy();
        });

    });

    describe("track url at index", function () {

        it("returns URL for existing track", function () {
            expect(this.album.trackUrlAtIndex(0))
                .toEqual('/music/Album A Track A.mp3');
        });

        it("returns null for non-existing track", function () {
            expect(this.album.trackUrlAtIndex(5)).toBe(null);
        });

    });

});

describe("Playlist", function() {
  
  beforeEach(function() {
      this.playlist = new Playlist();
      this.playlist.add(albumData[0]);
  });
  
  it("has models", function () {
      expect(this.playlist.models.length).toEqual(1);
  });
  
  it("identifies first album as first", function() {
      expect(this.playlist.isFirstAlbum(0)).toBeTruthy();
  });

  it("rejects non-first album as first", function() {
      expect(this.playlist.isFirstAlbum(1)).toBeFalsy();
  });

  it("identifies last album as last", function() {
      this.playlist.add(albumData[1]); // Extra album as the last
      expect(this.playlist.isLastAlbum(1)).toBeTruthy();
  });

  it("rejects non-last album as last", function() {
      this.playlist.add(albumData[1]); // Extra album as the last
      expect(this.playlist.isLastAlbum(0)).toBeFalsy();
  });
    
});

describe("Player", function () {

    describe("with no items", function () {

        beforeEach(function () {
            this.player = new Player();
        });

        it("starts with album 0", function () {
            expect(this.player.get('currentAlbumIndex')).toEqual(0);
        });

        it("starts with track 0", function () {
            expect(this.player.get('currentTrackIndex')).toEqual(0);
        });

    });

    describe("with added album", function () {

        beforeEach(function () {
            this.player = new Player();
            this.player.playlist.add(albumData[0]);
        });

        it("is in 'stop' state", function () {
            expect(this.player.get('state')).toEqual('stop');
        });
        
        it("is stopped", function() {
            expect(this.player.isStopped()).toBeTruthy();
        });

        describe("while playing", function () {

            beforeEach(function () {
                this.player.play();
            });

            it("sets to 'play' state", function () {
                expect(this.player.get('state')).toEqual('play');
            });

            it("is playing", function() {
                expect(this.player.isPlaying()).toBeTruthy();
            });

            it("has a current album", function () {
                expect(this.player.currentAlbum().get('title'))
                    .toEqual('Album A');
            });

            it("has a current track URL", function () {
                expect(this.player.currentTrackUrl())
                    .toEqual("/music/Album A Track A.mp3");
            });

            it("pauses", function() {
                this.player.pause();
                expect(this.player.get('state')).toEqual('pause');
            });

            describe("next track", function () {

                beforeEach(function() {
                    // Add extra album to test 'next'
                    this.player.playlist.add(albumData[1]);
                });

                it("increments within an album", function () {
                    this.player.nextTrack();

                    expect(this.player.get('currentAlbumIndex')).toEqual(0);
                    expect(this.player.get('currentTrackIndex')).toEqual(1);
                });

                it("goes to the next album", function () {
                    this.player.set({'currentTrackIndex': 1}); // Last track
                    this.player.nextTrack();
                    
                    expect(this.player.get('currentAlbumIndex')).toEqual(1);
                    expect(this.player.get('currentTrackIndex')).toEqual(0);
                });

                it("wraps around to the first album if at end", function () {
                    this.player.set({'currentAlbumIndex': 1}); // Last album
                    this.player.set({'currentTrackIndex': 1}); // Last track
                    this.player.nextTrack();
                    
                    expect(this.player.get('currentAlbumIndex')).toEqual(0);
                    expect(this.player.get('currentTrackIndex')).toEqual(0);
                });

            });

            describe("previous track", function () {

                beforeEach(function() {
                    // Add extra album to test 'prev'
                    this.player.playlist.add(albumData[1]);
                });

                it("goes to the previous track in an album", function () {
                    this.player.set({'currentTrackIndex': 1});
                    this.player.prevTrack();
                    
                    expect(this.player.get('currentAlbumIndex')).toEqual(0);
                    expect(this.player.get('currentTrackIndex')).toEqual(0);
                });
            
                it("goes to the last track of previous album", function() {
                    this.player.set({'currentAlbumIndex': 1});
                    this.player.set({'currentTrackIndex': 0});
                    this.player.prevTrack();
                    
                    expect(this.player.get('currentAlbumIndex')).toEqual(0);
                    expect(this.player.get('currentTrackIndex')).toEqual(1);
                });
                
                it("wraps around if at the very beginning", function() {
                    this.player.set({'currentAlbumIndex': 0});
                    this.player.set({'currentTrackIndex': 0});
                    this.player.prevTrack();
                    
                    expect(this.player.get('currentAlbumIndex')).toEqual(1);
                    expect(this.player.get('currentTrackIndex')).toEqual(1);
                });
            
            });

        });

    });

});
