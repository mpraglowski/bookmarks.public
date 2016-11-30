/**
 * Default to showing tags.
 */
var tagsVisible = true;


/**
 * Show all bookmarks
 */
function clearFilter() {
    $("#bookmarks").children().each(function () {
        $(this).show();
    });
    updateRelatedTags();
    updateTitle();
}

/**
 * Show only entries with zero tags.
 */
function showUntagged() {
    $("#bookmarks").children().each(function () {
        var tags = $(this).attr('title');
        (typeof tags !== 'undefined') ? $(this).hide() : $(this).show();
    });
    updateTitle();
}


/**
 * Show 25 random bookmarks
 */
function showRandom() {
    $("#bookmarks").children().each(function () {
        $(this).hide();
    });

    var links = $('#bookmarks').children(),
        len = links.length, random, i, $a;

    max = Math.min( 25, len )
    for (i = 0; i < max; i++) {
        random = Math.floor(Math.random() * links.length);
        $a = links.eq(random).show();
        links = links.not($a)
    }
}


/**
* Poplate the "related tags" area.
*/
function updateRelatedTags(tag)
{
    /*
     * For each bookmark - add the tags used if it contains the
     * currently selected tag.
     */
    var avail = "";
    $("#bookmarks").children().each(function () {
        var tags = $(this).attr('title');
        if ((typeof tags !== 'undefined') && (tags.toLowerCase().match(decodeURIComponent(tag))))
        {
            avail += "," + tags;
        }
    });

    /*
     * Split into an array, and downcase.
     */
    var tags = {};
    var a = avail.split(",");
    for (var i in a)
    {
        var nm = a[i];
        nm = nm.replace(/(^\s+|\s+$)/g, '');
        tags[ nm.toLowerCase() ] = 1;
    }

    /*
     * Unique and sort.
     */
    var keys = [];
    for (var t in tags)
    {
        if( t )
            keys.push(t);
    }
    var cleanKeys = $.unique(keys);
    cleanKeys.sort();

    /*
     * If there is only one tag then we have no related tags
     * so we hide the region and return.
     */
    if (cleanKeys.length < 2) {
        $("#related_holder").hide()
        return;
    } else {
        $("#related_holder").show()
    }
    /*
     * Now show the tags.
     */
    $("#related").html("");
    for (t in cleanKeys)
    {
        $("#related").append("<a class=\"tagfilter\" href=\"#" + encodeURIComponent(cleanKeys[t]) + "\">" + cleanKeys[t] + "</a>, ");
    }

    /** Remove trailing ", ". */
    $("#related").html($("#related").html().replace(/, $/, '.'));

}


/**
 * Show the number of visible bookmarks in the titlebar.
 */
function updateTitle()
{
    var count = $("#bookmarks > li:visible").length;
    var plural = ((count === 0) || (count > 1)) ? 's' : '';
    document.title = count + " visible bookmark" + plural;
}

/**
 * Add a bookmark.
 */
function addBookmark() {
    var name = $("#newName").val();
    var link = $("#newLink").val();
    var tags = $("#newTags").val();

    var date = new Date();
    var secs = Math.trunc(date.getTime() / 1000);

    // If the name or link is empty then ignore.
    if ( ( ! name ) || ( ! link ) ) {
        return;
    }

    var current = document.getElementById("bookmarks").innerHTML;
    var entry = '<li id="newOne" title="' + tags + '" time="' + secs + '"><a href="' + link + '">' + name + '</a></li>';
    current = current + entry;
    document.getElementById("bookmarks").innerHTML = current;
    populateTags();
}

/**
 * This function collects each distinct tag,
 * stripping whitespace, and placing into sorted order.
 */
function populateTags()
{
    var tags = {};
    $("#bookmarks").children().each(function () {
        var tag = $(this).attr("title");
        if (typeof tag !== 'undefined')
        {
            if (tag.match(","))
            {
                var a = tag.split(",");
                for (var i in a)
                {
                    var nm = a[i];
                    nm = nm.replace(/(^\s+|\s+$)/g, '');
                    tags[ nm.toLowerCase() ] = 1;
                }
            }
            else
            {
                tag = tag.replace(/(^\s+|\s+$)/g, '');
                tags[tag.toLowerCase()] = 1;
            }
        }
    });

    var keys = [];
    for (var t in tags)
    {
        if( t )
            keys.push(t);
    }

    var cleanKeys = $.unique(keys); // remove duplicate tags
    cleanKeys.sort();
    $("#autotags").html("");
    for (t in cleanKeys)
    {
        $("#autotags").append("<a class=\"tagfilter\" href=\"#" + encodeURIComponent(cleanKeys[t]) + "\">" + cleanKeys[t] + "</a>, ");
    }

    /** Remove trailing ", ". */
    $("#autotags").html($("#autotags").html().replace(/, $/, '.'));
}


/**
 * Toggle the display of tags beneath our bookmarks.
 */
function toggleTags() {
    if ( tagsVisible == false ) {
        showTags();
        tagsVisible = true;
    } else {
        hideTags();
        tagsVisible = false;
    }
}

/**
 *  Used by showTags()
 *  @param entry    the bookmark to be decorated
 *  @param tag      the list of tags to add to the entry
 */
function decorate(entry, tag) {
    var txt = '\n<ul><li>';
    var array = tag.toLowerCase().split(",");
    for (var i in array)
    {
        var nm = array[i];
        nm = nm.replace(/(^\s+|\s+$)/g, '');
        txt += "<a class=\"tagfilter\" href=\"#" + encodeURIComponent(nm) + "\">" + nm + "</a>, ";
    }

    /** Remove trailing ", ". */
    txt = txt.replace(/, $/, ".");
    entry.append(txt + "</li></ul>");
}


/**
 * Append the list of tags beneath each bookmark, for easy viewing.
 */
function showTags()
{
    $("#bookmarks").children().each(function () {
        var tag = $(this).attr("title");
        if (typeof tag !== 'undefined')
        {
            decorate($(this), tag);
        }
    });
}

/**
 * Remove the list of tags beneath each bookmark.
 */
function hideTags()
{
    $("#bookmarks").children().each(function () {
        var tag = $(this).attr("title");
        if (typeof tag !== 'undefined')
        {
            var tagsStripped = $(this).html().replace(/<ul><li>.*<\/li><\/ul>/, "\n");
            $(this).html(tagsStripped);
        }
    });
}

/**
 * Sort the items in the UL which contains our bookmarks.
 */
function sortBookmarks()
{
    var mylist = $('#bookmarks');
    var listitems = mylist.children('li').get();
    listitems.sort(function (a, b) {
        return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    });
    $.each(listitems, function (idx, itm) {
        mylist.append(itm);
    });
}

/**
 * Update the bookmarks, via the hash
 */
function updateView()
{
    if (typeof window.location.hash !== 'string' || window.location.hash.length === 0)
    {
        updateRelatedTags();
        return;
    }

    var tag = window.location.hash.substring(1);
    $("#bookmarks").children().each(function () {
        var tags = $(this).attr('title');
        ((typeof tags !== 'undefined') && (tags.toLowerCase().match(decodeURIComponent(tag))))
            ? $(this).show() : $(this).hide();
    });

    /*
     * Update the related tags & page-title
     */
    updateRelatedTags(tag);
    updateTitle();
}

/**
 * Load our bookmarks from the URL `bookmarks.data`, and setup our
 * initial state + listeners.
 */
function setup () {

    $("#bookmarks").load("bookmarks.data",function() {

        /** Sort the bookmarks */
        sortBookmarks();

        /** Populate the tags pane. */
        populateTags();

        /** Focus on the search/filter box. */
        $("#fill").focus();

        if ( tagsVisible ) {
            showTags();
        }
        /**
         * take the anchor (aka hash) and use it as filter to
         * show only entries with a given tag
         */
        window.onhashchange = function () {
            updateView();
        };

        /**
         * Search by title/url - case insensitive.
         */
        $("#fill").keyup(function () {
            filter = $("#fill").val().toLowerCase();
            if ( filter.length == 0 ) { return ; }

            $("#bookmarks").children().each(function () {
                var title = $(this).text().toLowerCase();
                var links = $(this).find("a");
                if (typeof links !== 'undefined')
                {
                    links = links.attr("href").toLowerCase();
                }
                (title.match(filter) || links.match(filter) || filter === "")
                    ? $(this).show() : $(this).hide();
            });
            updateRelatedTags();
            updateTitle();
        });

        /*
         * Now update the view - in case we were loaded with a
         * hash
         */
        updateView();
    });
}

/**
 * Setup our state.
 */
setup();
