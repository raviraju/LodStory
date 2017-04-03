/*!
* EIC PiecesUI
* Copyright 2012, Multimedia Lab - Ghent University - iMinds
* Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
*/
define(['lib/jquery','lib/prefixfree.jquery'],
  function ($) {
    "use strict";

    var pieceWidth = 120;

    function PiecesUI(presentationController) {
      this.controller = presentationController;        
      this.drawScreen($('#screen'));

    }

    PiecesUI.prototype = {
      drawPiece: function ($elem, options) {
        var x = options.x * (options.size - 0.22 * options.size) +
        ((1 - (options.y % 2)) * 0.215 * options.size),
        y = options.y * (options.size - 0.22 * options.size) +
        ((options.x % 2) * 0.215 * options.size);

        $elem.width(x + options.size).height(options.size);

        return $('<div />')
        .addClass('piece')
        .css({
          width: options.size,
          height: options.size,
          position: 'absolute',
          left: x,
          top: y,
          'transform': 'scale(' + (options.scaleX || 1) + ',' + (options.scaleY || 1) + ')',
          'background': 'url(' + options.img + ') no-repeat',
          'background-size': '100% 100%'
        })
        .appendTo($elem.children('.pieces'));
      },

      drawPieces: function ($title, nr, img, fontsize) {
        for (var i = 0; i < nr; i++) {
          this.drawPiece($title, {
            x: i,
            y: 0,
            size: pieceWidth,
            scaleY: (1 - 2 * (i % 2)),
            img: img
          });

          var $content = $title
          .children('.content');
          $content.css({
            'margin-top': fontsize ? (pieceWidth - fontsize) / 2 + 10 : 10,
            'margin-left': fontsize ? 30 : 0.22 * pieceWidth,
            'font-size': fontsize || pieceWidth
          });
        }
      },
      drawBigPieces: function ($title) {
        var new_width = pieceWidth * 4;
        var step = 1;

        for (var i = 0; i < 2; i++) {
          for (var j = 0; j < 2; j++) {

            var piece = this.drawPiece($title, {
              x: i,
              y: j,
              size: new_width,
              scaleX: (1 - 2 * (j % 2)),
              scaleY: (1 - 2 * (i % 2)),
              img: (i === 0 && j === 1) ? 'images/piece4.svg' : 'images/piece3.svg' //Add white piece
            })
            .attr('id', 'piece_' + step)
            .hide();

            $('#step_' + step).css({
              display: 'none',
              left: piece.css('left'),
              top: piece.css('top'),
              'margin-left': new_width * 0.22,
              'margin-top': new_width * 0.22,
              width: new_width - 2 * (new_width * 0.22) - 10
            });

            step++;
          }
        }

        //Some fixes adjusting the last step
        $('#step_4').css({
          'margin-left': new_width * 0.215 + 40,
          'margin-top': new_width * 0.215,
          width: new_width - 2 * (new_width * 0.22) - 40
        });
      },
      disableElement: function ($elem, disabled) {
        if (disabled)
          $elem
          .addClass('disabled')
          .prop("disabled", true);
        else
          $elem
          .removeClass('disabled')
          .prop("disabled", false);
      },
      animate: function ($elem, name, duration, callback) {
        if (callback)
          window.setTimeout(callback, duration * 1000);

        return $elem.css({
          'animation-name': name,
          'animation-duration': duration + 's',
          'transition-timing-function': 'linear'
        });
      },
      initControls: function () {
                 //Dipa's slide-editing stuff
               $('#imgs').css('display', 'inline-block');
               $('#vids').css('display', 'none');
               $('#edit-imgs').click(function(){
                       $('#imgs').css('display', 'inline-block');
                       $('#img-element-list-wrap').css('display', 'inline-block');
                       $('#vids').css('display', 'none');
                       $('#vid-element-list-wrap').css('display', 'none');
                       $('#edit-imgs').removeClass('btn-primary');
                       $('#edit-vids').addClass('btn-primary');
               });
               $('#edit-vids').click(function(){
                       $('#imgs').css('display', 'none');
                       $('#img-element-list-wrap').css('display', 'none');
                       $('#vids').css('display', 'inline-block');
                       $('#vid-element-list-wrap').css('display', 'inline');
                       $('#edit-imgs').addClass('btn-primary');
                       $('#edit-vids').removeClass('btn-primary');
               });
      },

      // Updates the start topic.
      updateStartTopic: function () {
        this.controller.startTopic = {
          label: $('#starttopic').val(),
          uri: $('#starttopic').data('uri') || ''
        };
        location.hash = "#start=" + encodeURIComponent($('#starttopic').val()) + "&start-uri=" + encodeURIComponent($('#starttopic').data('uri') || '');
        this.hash = location.hash;
        var valid = this.controller.startTopic.uri.length > 0;
        // Enable second step if the topic is valid.
        this.disableElement($('#step_1 .next'), !valid);
      },

      // Updates the goal topic.
      updateEndTopic: function () {
        this.controller.endTopic = {
          label: $('#endtopic').val(),
          uri: $('#endtopic').data('uri') || ''
        };
        var valid = this.controller.endTopic.uri.length > 0;
        location.hash = this.hash + "&end=" + encodeURIComponent($('#endtopic').val()) + "&end-uri=" + encodeURIComponent($('#endtopic').data('uri') || '');
        
        // Enable third step if the topic is valid.
        this.disableElement($('#step_3 .next'), !valid);
      },

      drawScreen: function ($screen) {
        var self = this;
        $screen.show();

            // Try to start the movie
            try {
                  self.controller.playMovie();
            }
            // Controller errors are emergency cases we cannot handle gracefully
            catch (error) {
              window.alert("Unexpected error: " + error);
              window.location.reload();
            }
        //  })
        //.css({
        //  width: '0px',
        //  height: '0px',
        //  left: -3 * 0.88 * pieceWidth - 5,
        //  top: 400 - (pieceWidth * 8 * 2),
        //  transform: 'rotate(0deg) scale(3, 3)'
        //});
      }
    };

    return PiecesUI;
  });
