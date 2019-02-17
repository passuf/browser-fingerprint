/**
 * Settings
 */

var KEY_FINGERPRINT_SUBMITTED = 'fingerprint_submitted';
var ROBOHASH_URL = 'https://robohash.org/';

/**
 * Settings
 */

var fingerprint;


/**
 * Helper Methods
 */

var calculateFingerprint = function () {
    var d1 = new Date();

    fingerprint.get(function (result, components) {
        var d2 = new Date();
        var timeString = (d2 - d1) + "ms";
        var details = "";
        if (typeof window.console !== "undefined") {
            console.log(timeString);
            console.log(result);
            for (var index in components) {
                var obj = components[index];
                var value = obj.value.toString();
                var line = obj.key + " = " + value.substring(0, 400);
                if (value.length > 400) {
                    line = line + "...";
                }
                details += "<li title='" + value + "'>" + line + "</li>";
            }
        }

        $("#fingerprint_robohash").attr("src", ROBOHASH_URL + result + '.png?sets=1');
        $("#fingerprint-details").html(details);
        $("#fp").text(result);
        $("#fingerprint-time").text(timeString);

        $("#fingerprint_result_section").removeClass("hidden");
        $("#fingerprint_details_section").removeClass("hidden");
        $("#compare_section").removeClass("hidden");

        postData(result, components);
    });
};

var compareFingerprints = function () {
    var f1 = $("#fp").text();
    var f2 = $("#compare_fingerprint").val();

    var score = -1;
    var description = "";
    try {
        var d1 = new Tlsh.DigestHashBuilder().withHash(f1).build();
        var d2 = new Tlsh.DigestHashBuilder().withHash(f2).build();
        score = d1.calculateDifference(d2, true);

        if ((typeof score) !== 'number' || isNaN(score)) {
            description = "Not a valid fingerprint"
        } else if (score === 0) {
            description = score + " (equal)";
        } else if (score < 25) {
            description = score + " (very similar)";
        } else if (score < 80) {
            description = score + " (similar)";
        } else {
            description = score + " (not similar)";
        }
    } catch (e) {
        description = "Not a valid fingerprint";
    }

    $("#comparison_result").text(description);
    $("#comparison_result_section").removeClass("hidden");
};

var postData = function (fingerprint, components) {
    // Check if we need to submit the fingerprint
    if (window.localStorage) {
        if (localStorage.getItem(KEY_FINGERPRINT_SUBMITTED)) {
            // Fingerprint has already been submitted
            console.log('Already participated, no need to submit again');
            return;
        }
    }

    // Extract values to generate string which has been used to generate signature
    var values = [];
    for (var idx in components) {
        var val = components[idx].value;
        if (typeof components[idx].value.join !== "undefined") {
            val = val.join(";");
        }
        values.push(val);
    }

    // Parse GET params
    var getParams = window.location.search.substring(1);

    $.post('https://blackhole.passuf.ch/63595e34-cb1a-49a7-932c-00baceee475a/', {
        'data': JSON.stringify(values.join("~~~")),
        'fingerprint': fingerprint,
        'get_params': getParams
    }).success(function () {
        if (window.localStorage) {
            // Remember that we have submitted the fingerprint
            localStorage.setItem(KEY_FINGERPRINT_SUBMITTED, new Date());
        }
    });
};

var showError = function (msg) {
    $("#btn").addClass("hidden");

    var errorMessage = $("#errorMessage");

    errorMessage.text(msg);
    errorMessage.removeClass("hidden");
};


/**
 * Initialization
 */

$(document).ready(function () {
    try {
        fingerprint = new Fingerprint2();
    } catch (e) {
        console.log('Could not load Fingerprint2(), are you using a content blocker? Congratulations! Error: ', e);
        showError('Something went wrong. Are you using a content blocker?');
        return;
    }

    $("#btn").on("click", calculateFingerprint);
    $("#btn-compare").on("click", compareFingerprints);

});