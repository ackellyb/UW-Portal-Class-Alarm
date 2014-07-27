function mclarizi(userid, htmlId) {
	var templates = {};

	/*
	 * Initialize the widget.
	 */
	portal.loadTemplates("widgets/mclarizi/templates.json",
		function (t) {
			templates = t;
			$(htmlId).html(templates.baseHtml);
		});

	$("#mclarizi_scheduleButton").click(function (t) {
		templates = t;
		$(htmlId).html(templates.confirmPage);
	});
}