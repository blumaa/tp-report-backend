const graphql = require("graphql");
const _ = require("lodash");
// const Place = require("../../models/place");
// const Report = require("../../models/Report");
import Place from "../../models/place";
import Report from "../../models/report";
import SearchTerm from '../../models/searchTerm'
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
} = graphql;

// define the objects

const PlaceType = new GraphQLObjectType({
  name: "Place",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    googleId: { type: GraphQLString },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    inStock: { type: GraphQLBoolean },
    reports: {
      type: new GraphQLList(ReportType),
      resolve(parent, args) {
        // return _.filter(reports, { googleId: parent.googleId });
        return Report.find({ googleId: parent.googleId });
      },
    },
  }),
});

const ReportType = new GraphQLObjectType({
  name: "Report",
  fields: () => ({
    id: { type: GraphQLID },
    placeName: { type: GraphQLString },
    itemName: { type: GraphQLString },
    status: { type: GraphQLString },
    placeId: { type: GraphQLString },
    googleId: { type: GraphQLString },
    dateTime: { type: GraphQLDateTime },
    place: {
      type: PlaceType,
      resolve(parent, args) {
        // console.log(parent);
        // return _.find(places, { googleId: parent.googleId });
        // return Place.findById(parent.placeId);
        return Place.findOne({ googleId: parent.googleId });
      },
    },
  }),
});

const SearchTermType = new GraphQLObjectType({
  name: "SearchTerm",
  fields: () => ({
    id: { type: GraphQLID },
    term: { type: GraphQLString },
    dateTime: { type: GraphQLDateTime },
  }),
});

// define queries and mutations

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    searchterm: {
      // this will be used to collect user search data
      type: SearchTermType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return SearchTerm.findById(args.id);
      },
    },
    searchterms: {
      // this will be used to collect user search data
      type: new GraphQLList(SearchTermType),
      resolve(parent, args) {
        return SearchTerm.find({});
      },
    },
    place: {
      type: PlaceType,
      args: { googleId: { type: GraphQLString }, id: { type: GraphQLID } },
      resolve(parent, args) {
        // console.log(args.googleId);
        // return _.find(places, { googleId: args.googleId });
        const place = Place.findOne({ googleId: args.googleId });
        if (place) {
          // console.log(place)
          return place;
        }
        // return {status: "success", place}
      },
    },
    places: {
      type: new GraphQLList(PlaceType),
      args: { lat: { type: GraphQLInt }, lng: { type: GraphQLInt } },
      async resolve(parent, args) {
        // return _.filter(places, { lat: args.lat, lng: args.lng });
        try {
          const places = await Place.find({});
          return places;
        } catch (error) {
          throw error;
        }
        // is this where I want to fetch on the backend?
        // return Place.find({});
      },
    },
    report: {
      type: ReportType,
      args: {
        id: { type: GraphQLID },
        googleId: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      resolve(parent, args) {
        // return _.find(reports, { id: args.id });
        return Report.findById(args.id);
      },
    },
    reports: {
      type: new GraphQLList(ReportType),
      resolve(parent, args) {
        // return reports
        return Report.find({});
      },
    },
  },
});

// mutations

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addTerm: {
      type: SearchTermType,
      args: {
        term: { type: GraphQLString },
        dateTime: { type: GraphQLDateTime },
      },
      resolve(parent, args) {
        let term = new SearchTerm({
          term: args.term,
          dateTime: new Date().toISOString()
        });
        return term.save();
      },
    },
    addPlace: {
      type: PlaceType,
      args: {
        name: { type: GraphQLString },
        googleId: { type: GraphQLString },
        lat: { type: GraphQLFloat },
        lng: { type: GraphQLFloat },
        inStock: { type: GraphQLBoolean },
      },
      resolve(parent, args) {
        let place = new Place({
          name: args.name,
          googleId: args.googleId,
          lat: args.lat,
          lng: args.lng,
          inStock: args.inStock,
        });
        return place.save();
      },
    },
    addReport: {
      type: ReportType,
      args: {
        itemName: { type: GraphQLString },
        placeName: { type: GraphQLString },
        status: { type: GraphQLString },
        placeId: { type: GraphQLString },
        googleId: { type: GraphQLString },
        dateTime: { type: GraphQLDateTime },
        // googleId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        // console.log(typeof args.googleId, args.googleId);
        console.log("placeName", args.placeName);
        // console.log("args.dateTime", args.dateTime);

        // search for already existing place
        const place = Place.findOne(
          { googleId: args.googleId },
          (err, result) => {
            // console.log("found place", result);
            if (!result) {
              console.log("creating new place");
              let newPlace = new Place({
                name: args.placeName,
                googleId: args.googleId,
              });
              newPlace.save();
            }
          }
        );
        //return new place and new report
        Date.prototype.toIsoString = function() {
          var tzo = -this.getTimezoneOffset(),
              dif = tzo >= 0 ? '+' : '-',
              pad = function(num) {
                  var norm = Math.floor(Math.abs(num));
                  return (norm < 10 ? '0' : '') + norm;
              };
          return this.getFullYear() +
              '-' + pad(this.getMonth() + 1) +
              '-' + pad(this.getDate()) +
              'T' + pad(this.getHours()) +
              ':' + pad(this.getMinutes()) +
              ':' + pad(this.getSeconds()) +
              dif + pad(tzo / 60) +
              ':' + pad(tzo % 60);
      }
      
      let dt = new Date();
      console.log('dt', dt.toIsoString());
      
        // const currTime = new Date().toLocaleString()
        // console.log('currtime', currTime)

        let report = new Report({
          itemName: "toilet paper",
          googleId: args.googleId,
          status: args.status,
          dateTime: dt.toIsoString(),
        });
        console.log('report', report)
        return report.save();
      },
    },
  },
});

//export the rootquery

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
