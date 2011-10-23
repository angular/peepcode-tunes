(function($) {

    window.Album = Backbone.Model.extend({

        isFirstTrack: function(index) {
            return index == 0;
        },

        isLastTrack: function(index) {
            return index >= this.get('tracks').length - 1;
        },

        trackUrlAtIndex: function(index) {
            if (this.get('tracks').length >= index) {
                return this.get('tracks')[index].url;
            }
            return null;
        }

    });

    window.Albums = Backbone.Collection.extend({
        model: Album,
        url: "/albums"
    });

    window.Playlist = Albums.extend({

        isFirstAlbum: function(index) {
            return (index == 0)
        },

        isLastAlbum: function(index) {
            return (index == (this.models.length - 1))
        }

    });

    window.Player = Backbone.Model.extend({
        defaults: {
            'currentAlbumIndex': 0,
            'currentTrackIndex': 0,
            'state': 'stop'
        },

        initialize: function() {
            this.playlist = new Playlist();
        },

        reset: function() {
            this.set({
                'currentAlbumIndex': 0,
                'currentTrackIndex': 0,
                'state': 'stop'
            });
        },

        play: function() {
            this.set({
                'state': 'play'
            });
            this.trigger('change:currentTrackIndex');
            this.logCurrentAlbumAndTrack();
        },

        pause: function() {
            this.set({
                'state': 'pause'
            });
        },

        isPlaying: function() {
            return (this.get('state') == 'play');
        },

        isStopped: function() {
            return (!this.isPlaying());
        },

        currentAlbum: function() {
            return this.playlist.at(this.get('currentAlbumIndex'));
        },

        currentTrackUrl: function() {
            var album = this.currentAlbum();
            if (album) {
                return album.trackUrlAtIndex(this.get('currentTrackIndex'));
            } else {
                return null;
            }
        },

        nextTrack: function() {
            var currentTrackIndex = this.get('currentTrackIndex'),
            currentAlbumIndex = this.get('currentAlbumIndex');
            if (this.currentAlbum().isLastTrack(currentTrackIndex)) {
                if (this.playlist.isLastAlbum(currentAlbumIndex)) {
                    this.set({
                        'currentAlbumIndex': 0
                    });
                    this.set({
                        'currentTrackIndex': 0
                    });
                } else {
                    this.set({
                        'currentAlbumIndex': currentAlbumIndex + 1
                    });
                    this.set({
                        'currentTrackIndex': 0
                    });
                }
            } else {
                this.set({
                    'currentTrackIndex': currentTrackIndex + 1
                });
            }
            this.logCurrentAlbumAndTrack();
        },

        prevTrack: function() {
            var currentTrackIndex = this.get('currentTrackIndex'),
            currentAlbumIndex = this.get('currentAlbumIndex'),
            lastModelIndex = 0;
            if (this.currentAlbum().isFirstTrack(currentTrackIndex)) {
                if (this.playlist.isFirstAlbum(currentAlbumIndex)) {
                    lastModelIndex = this.playlist.models.length - 1;
                    this.set({
                        'currentAlbumIndex': lastModelIndex
                    });
                } else {
                    this.set({
                        'currentAlbumIndex': currentAlbumIndex - 1
                    });
                }
                // In either case, go to last track on album
                var lastTrackIndex =
                this.currentAlbum().get('tracks').length - 1;
                this.set({
                    'currentTrackIndex': lastTrackIndex
                });
            } else {
                this.set({
                    'currentTrackIndex': currentTrackIndex - 1
                });
            }
            this.logCurrentAlbumAndTrack();
        },

        logCurrentAlbumAndTrack: function() {
            console.log("Player " +
            this.get('currentAlbumIndex') + ':' +
            this.get('currentTrackIndex'), this);
        }

    });

    window.library = new Albums();
    window.player = new Player();


    $(document).ready(function() {

        window.AlbumView = Backbone.View.extend({
            template: _.template($("#album-template").html()),
            tag: 'li',
            className: 'album',

            initialize: function() {
                _.bindAll(this, 'render');
            },

            render: function() {
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
            }
        });

        window.PlaylistAlbumView = AlbumView.extend({
            events: {
                'click .queue.remove': 'removeFromPlaylist'
            },

            initialize: function() {
                _.bindAll(this, 'render',
                                'updateState',
                                'updateTrack',
                                'remove');

                this.player = this.options.player;
                this.player.bind('change:state', this.updateState);
                this.player.bind('change:currentTrackIndex', this.updateTrack);

                this.model.bind('remove', this.remove);
            },

            render: function() {
                $(this.el).html(this.template(this.model.toJSON()));
                this.updateTrack();
                return this;
            },

            updateState: function() {
                var isAlbumCurrent = (this.player.currentAlbum() === this.model);
                $(this.el).toggleClass('current', isAlbumCurrent);
            },

            updateTrack: function() {
                var isAlbumCurrent = (this.player.currentAlbum() === this.model);
                if (isAlbumCurrent) {
                    var currentTrackIndex = this.player.get('currentTrackIndex');
                    this.$("li").each(function(index, el) {
                        $(el).toggleClass('current', index == currentTrackIndex);
                    });
                }
                this.updateState();
            },

            removeFromPlaylist: function() {
                this.options.playlist.remove(this.model);
                this.player.reset();
            }
        });

        window.LibraryAlbumView = AlbumView.extend({
            events: {
                'click .queue.add': 'select'
            },

            select: function() {
                this.collection.trigger('select', this.model);
            }
        });

        window.PlaylistView = Backbone.View.extend({
            tag: 'section',
            className: 'playlist',
            template: _.template($("#playlist-template").html()),

            events: {
                'click .play': 'play',
                'click .pause': 'pause',
                'click .next': 'nextTrack',
                'click .prev': 'prevTrack'
            },

            initialize: function() {
                _.bindAll(this, 'render',
                'renderAlbum',
                'updateState',
                'updateTrack',
                'queueAlbum');
                this.collection.bind('reset', this.render);
                this.collection.bind('add', this.renderAlbum);

                // TODO: May need to bind to currentAlbumIndex too
                this.player = this.options.player;
                this.player.bind('change:state', this.updateState);
                this.player.bind('change:currentTrackIndex', this.updateTrack);
                this.createAudio();

                this.library = this.options.library;
                this.library.bind('select', this.queueAlbum);
            },

            createAudio: function() {
                this.audio = new Audio();
            },

            render: function() {
                $(this.el).html(this.template(this.player.toJSON()));
                this.collection.each(this.renderAlbum);

                this.updateState();
                return this;
            },

            renderAlbum: function(album) {
                var view = new PlaylistAlbumView({
                    model: album,
                    player: this.player,
                    playlist: this.collection
                });
                this.$("ul").append(view.render().el);
            },

            updateState: function() {
                this.updateTrack();
                this.$("button.play").toggle(this.player.isStopped());
                this.$("button.pause").toggle(this.player.isPlaying());
            },

            updateTrack: function() {
                this.audio.src = this.player.currentTrackUrl();
                if (this.player.get('state') == 'play') {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            },

            queueAlbum: function(album) {
                this.collection.add(album);
            },

            play: function() {
                this.player.play();
            },

            pause: function() {
                this.player.pause();
            },

            nextTrack: function() {
                this.player.nextTrack();
            },

            prevTrack: function() {
                this.player.prevTrack();
            }
        });

        window.LibraryView = Backbone.View.extend({
            tagName: 'section',
            className: 'library',
            template: _.template($('#library-template').html()),

            initialize: function() {
                _.bindAll(this, 'render');
                this.collection.bind('reset', this.render);
            },

            render: function() {
                var $albums,
                collection = this.collection;

                $(this.el).html(this.template({}));
                $albums = this.$(".albums");
                this.collection.each(function(album) {
                    var view = new LibraryAlbumView({
                        model: album,
                        collection: collection
                    });
                    $albums.append(view.render().el);
                });

                return this;
            }
        });

        window.BackboneTunes = Backbone.Router.extend({
            routes: {
                '': 'home',
                'blank': 'blank'
            },

            initialize: function() {
                this.playlistView = new PlaylistView({
                    collection: window.player.playlist,
                    player: window.player,
                    library: window.library
                });

                this.libraryView = new LibraryView({
                    collection: window.library
                });
            },

            home: function() {
                $('#container').empty();
                $("#container").append(this.playlistView.render().el);
                $("#container").append(this.libraryView.render().el);
            },

            blank: function() {
                $('#container').empty();
                $('#container').text('blank');
            }
        });

        // Kick off the application
        window.App = new BackboneTunes();
        Backbone.history.start();
    });

})(jQuery);

// vim:sw=4:ts=4:expandtab
