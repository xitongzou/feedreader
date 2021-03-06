(function() {
    function e(e) {
        var t = new google.feeds.Feed("http://feeds.feedburner.com/TEDTalks_video");
        if (!App.TotalEntries) {
            App.TotalEntries = 25
        }
        t.setNumEntries(App.TotalEntries);
        t.setResultFormat(google.feeds.Feed.JSON_FORMAT);
        t.includeHistoricalEntries();
        t.load(function(t) {
            if (!t.error) {
                var n = document.getElementById("feed");
                var i = 1;
                App.FeedEntries.reset();
                App.FeedEntries.add({});
                if (!App.NumEntriesPerPage) {
                    App.NumEntriesPerPage = 5
                }
                for (var o = 0; o < t.feed.entries.length; o = o + App.NumEntriesPerPage) {
                    App.FeedEntries.add(new s({
                        pageIndex: i,
                        content: []
                    }), {
                        at: i
                    });
                    for (var u = 0; u < App.NumEntriesPerPage; u++) {
                        App.FeedEntries.at(i).get("content").push(t.feed.entries[o + u])
                    }
                    i++
                }
                App.PaginationView = new l({
                    model: App.FeedEntries
                });
                r(e)
            }
        })
    }

    function t(t) {
        App.CurrentPage = parseInt(t);
        google.setOnLoadCallback(e(t))
    }

    function n() {
        if (App.CurrentPage) {
            $(".pagination li").removeClass("active").removeClass("disabled");
            $(".pagination").find(".page" + App.CurrentPage).addClass("active");
            if (App.CurrentPage === 1) {
                $(".prev").addClass("disabled")
            } else if (App.CurrentPage === App.TotalEntries / App.NumEntriesPerPage) {
                $(".next").addClass("disabled")
            }
        }
    }

    function r(e) {
        App.FeedContent.reset();
        var t = App.FeedEntries.at(e).get("content");
        for (var r = 0; r < App.NumEntriesPerPage; r++) {
            var s = t[r];
            var o = new i(s);
            var u = s.mediaGroups[0].contents[0];
            o.set({
                thumbnailUrl: u.thumbnails[0].url
            });
            o.set({
                videoUrl: u.url
            });
            o.set({
                category: s.categories[0]
            });
            o.set({
                index: r
            });
            App.FeedContent.add(o)
        }
        n()
    }
    var i = Backbone.Model.extend({
        title: "",
        author: "",
        content: "",
        contentSnippet: "",
        link: "",
        categories: [],
        mediaGroups: [],
        publishedDate: "",
        thumbnailUrl: "",
        category: "",
        videoUrl: "",
        index: 0
    });
    var s = Backbone.Model.extend({
        pageIndex: 0,
        content: []
    });
    var o = Backbone.Collection.extend({
        model: i
    });
    var u = Backbone.Collection.extend({
        model: s
    });
    var a = Backbone.Router.extend({
        routes: {
            "": "index"
        },
        index: function() {
            this.navigate("page/1", {
                trigger: true
            })
        },
        initialize: function(e) {
            this.route("page/:number", "page", function(e) {
                App.CurrentPage = parseInt(e);
                t(e)
            });
            this.route("next", function() {
                this.navigate("page/" + (App.CurrentPage + 1), {
                    trigger: true
                })
            });
            this.route("prev", function() {
                this.navigate("page/" + (App.CurrentPage - 1), {
                    trigger: true
                })
            })
        }
    });
    Handlebars.registerHelper("index-helper", function(e, t) {
        return e + t
    });
    var f = Backbone.View.extend({
        model: null,
        el: $("#feedcontent-holder"),
        initialize: function() {
            this.model.on("add", this.render, this)
        },
        render: function() {
            var e = $("#feedcontent-template").html();
            var t = Handlebars.compile(e);
            this.$el.html(t({
                entries: this.model.toJSON()
            }))
        }
    });
    var l = Backbone.View.extend({
        model: null,
        el: $("#pagination-holder"),
        initialize: function() {
            this.render()
        },
        render: function() {
            var e = $("#pagination-template").html();
            var t = Handlebars.compile(e);
            this.$el.html(t({
                pageItems: this.model.toJSON()
            }))
        }
    });
    var c = Backbone.View.extend({
        model: null,
        el: $("#adjust-form"),
        events: {
            "click button": "adjustFeed"
        },
        adjustFeed: function(e) {
            var t = parseInt($("#num-entries")[0].value);
            var n = parseInt($("#total-entries")[0].value);
            if (t && typeof t === "number") {
                App.NumEntriesPerPage = t
            }
            if (n && typeof n === "number") {
                App.TotalEntries = n
            }
            App.AppRouter.navigate("", {
                trigger: true
            })
        }
    });
    $(function() {
        App = {};
        App.AppRouter = new a;
        App.FeedEntries = new u;
        App.FeedContent = new o;
        App.FeedContentView = new f({
            model: App.FeedContent
        });
        App.PaginationView = new l({
            model: App.FeedEntries
        });
        App.FormView = new c;
        Backbone.history.start()
    })
})()