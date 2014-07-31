function mclarizi(userid, htmlId) {
	var templates = {};

	var model = {
		views: [],

		/**
		 * Add a new view to be notified when the model changes.
		 */
		addView: function (view) {
			this.views.push(view);
			view("");
		},

		/**
		 * Update all of the views that are observing us.
		 */
		updateViews: function (msg) {
			var i = 0;
			for (i = 0; i < this.views.length; i++) {
				this.views[i](msg);
			}
		},

		loadConfirmPage: function (time) {
			model.updateViews("confirm");
		}

	};

	var baseView = {
		updateView: function (msg) {
			if (msg === "confirm") {
				$(htmlId).html(templates.confirmPage);
			} else if (msg === "final") {
				$(htmlId).html(templates.finalPage);
			}
		},

		initView: function () {
			console.log("Initializing baseView");

			/*
			 * Set the controller for the "Go" button.
			 * Get the subject and catalog from the input fields and
			 * then tell the model to get the corresponding course.
			 */
			$("#mclarizi_scheduleButton").click(function () {
				var time = $("#mclarizi_timeInput").val();
				console.log("Schedule clicked: " + time);
				model.loadConfirmPage(time);
			});
			model.addView(baseView.updateView);
		}
	};
	/*
	 * Initialize the widget.
	 */
	portal.loadTemplates("widgets/mclarizi/templates.json",
		function (t) {
			templates = t;
			$(htmlId).html(templates.baseHtml);
			baseView.initView();
		});
}