dojo.provide("scorll.asset.Tracking");

dojo.require("scorll.asset.Dialog");

dojo.require("scorll.asset.TrackingStats");
dojo.require("dojo.store.Memory");
dojo.require("dojo.data.ObjectStore");

dojo.declare("scorll.asset.Tracking", null, {
  userTrackingData: new dojo.store.Memory(),
  userTrackingDataHistory: {},
  statsForm: null,
  track: function (params, callback) {
    var asset = this;
    params.assetId = asset.item.id;
    if (!asset.user.authenticated) {
      asset.onLoginRequired(function (err) {
        if (err) {
          callback(err);
        }
        else {
          asset.client.call(asset, "track", params, callback);
        }
      });
    }
    else {
      asset.client.call(asset, "track", params, callback);
    }
  },
  getTrackingResult: function (callback) {
    var asset = this;
    var params = {
      assetId: asset.item.id,
      userId: asset.user.id
    };
    asset.client.call(asset, "getTrackingResults", params, callback);
  },
  getAllTrackingResults: function (callback) {
    var asset = this;
    if (!asset.user.hasRole("teacher")) {
      return;
    }
    var params = {
      assetId: asset.item.id,
      userId: null
    };
    asset.client.call(asset, "getTrackingResults", params, function (err, results) {
      for (var i in results) {
        var r = results[i];
        var response = r.responses[r.responses.length - 1];
        asset.userTrackingData.put({
          id: r.ownerId,
          username: r.username,
          response: response.response,
          result: response.result
        });
      }
      asset.statsForm && asset.statsForm.resultsGrid._refresh();
      callback && callback(err, results);
    });
  },
  collect: function (tracking) {
    console.log(tracking);
    var asset = this;
    var response = tracking.responses[tracking.responses.length - 1];
    asset.userTrackingData.put({
      id: tracking.ownerId,
      username: tracking.username,
      response: response.response,
      result: response.result
    });
    asset.statsForm && asset.statsForm.resultsGrid._refresh();
    asset.userTrackingDataHistory[tracking.userId] = tracking;
    this.onCollect({
      userId: tracking.ownerId,
      username: tracking.username,
      response: response.response,
      result: response.result
    });
  },
  onCollect: function (collectedData) {},
  // Override this function to show a user friendly label
  // in TrackingStats
  getLearnerResponseAsString: function (learnerResponse) {
    return "test";
  },
  TRACKING_TYPE: {
    TRUE_FALSE: "true-false",
    CHOICE: "choice",
    FILL_IN: "fill-in",
    LIKERT: "likert",
    MATCHING: "matching",
    PERFORMANCE: "performance",
    SEQUENCING: "sequencing",
    NUMERIC: "numeric",
    OTHER: "other"
  }
});
