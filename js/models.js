(function(){
  var module = angular.module('letsrule-models',['ui-devlog', 'modules.pool']);
  
//  module.service('Pool', function(){
//    angular.extend(this, {
//      POPS:[],
//      cities:[],
//      regions:[],
//      countries:[],
//      companies:[],
//      products: [],
//      produnits: []
//    });
//
//  });

//  module.factory('POP', function(Pool){
//    function POP(data,parent){
//      this.id = Pool.POPS.getLength();
//      this._parent = parent;
//      this.poptype = data.poptype;
//      this.amount = data.amount;
//      this.location = parent.name;
//      this.economy = {
//        income: 0,
//        expenses: 0,
//        savings: 0,
//        market: parent.economy.market
//      };
//
//      this.needs = {
//        'basic': {
//
//        },
//        'luxury': {
//
//        }
//      };
//
//      this.grow = function(){
//        this.amount += 100;
//      };
//      this.consume = function(){
//        for (var i in this.needs){
//          var total = (this.needs[i] * this.amount);
//          var totalcost = (this.economy.market[i].price * total);
//          this.economy.market[i].amount -= total;
//          this.economy.expenses += totalcost;
//          console.log(this.amount +' '+this.poptype+'s from ' + this.location +' consumed ' + (total*1000) +' kgs of '+ i)
//        }
//      };
//
//      Pool.POPS.add(this);
//    }
//
//    return POP;
//  });

  module.factory('City', function(POP,Pool){
    function City(data,parent){
      this.id = Pool.cities.getLength();
      this.name = data.name;
      this.economy = {
        "GDP": 0,
        "inflation": 0,
        "interestRate": 0,
        "market": parent.economy.market
      };
      this.geo = data.geo;
      var self = this;
      this.growth = {
        amount: 0,
        factors: function(){
          var factors = {
            immigration: country.get('immigration'),
            popGrowth: country.get('popGrowth'),
            avgWage: self.get('avgWage')
          };
          
        },
        effects: function(){
          housing: 0 //formula to calculate housing shortage
        }
      };
      var getPops = function(){
        var arr = [];
        for (var i in data.pops){
          var dat = data.pops[i];
          dat.economy = {
            income: 0,
            expenses: 0,
            savings: 0,
            market: self.economy.market
          };
          var pop = new POP(dat);
          pop.migrate(self.name);
          arr.push(pop);
        }
        return arr;
      };
      this.POPS = getPops();
      this.getPopulation = function(){
        var amount = 0;
        this.POPS.forEach(function(pop){
          amount += pop.amount;
        })
        return amount;
      }
      Pool.cities.add(this);
    }

    return City;
  });

  module.factory('Region', function(City){
    function Region(data,parent){
      this.id = data.id;
      this.name = data.name;
    
      this.economy = {
        "GDP": 0,
        "inflation": 0,
        "interestRate": 0,
        "market": parent.economy.market
      };
      var self = this;
      var getCities = function(){
        var arr = [];

        for (var i in data.cities) {
          
          arr.push(new City(data.cities[i],self));
        }
        return arr;
      };
      this.cities = getCities();

      this.getPops = function(){
        var total = 0;
        for (var i in this.cities){
          for(var j in this.cities[i].POPS)
            total += this.cities[i].POPS[j].amount;
        };
        return total;
      };
    }

    return Region;
  });

  module.factory('Market', function(Company){
    return function Market(){
      this.companies = [];
      this.products = {};
      this.addCompany = function(data) {
        var company = new Company(data, this);
        this.companies.push(company.id)
      }

    };
  });

  module.factory('Country', ['devlog','Market','Region','Product', function($log,Market, Region, Product){
    function Country(data){
      var self = this;
      function getRegions(){
        
        var arr = [];
        for (var i in data.regions) {
          
          var r = new Region(data.regions[i], self);
          r.owner = data.name;
          r.economy.market = self.economy.market;
          arr.push(r);
        }
        return arr;
      }

      this.name = data.name;
      this.economy = {
        market: new Market()
      };
      data.companies.forEach(function(company){
        self.economy.market.addCompany(company);
      })
      this.capital = data.capital;
      this.regions = getRegions();
      
      this._loopPOPS = function(cb){
        this.regions.forEach(function(region){
          region.cities.forEach(function(city){
            city.POPS.forEach(function(pop){
              cb(pop);
            })
          })
        })
      };

      $log.addEvent('Loaded country : '+ data.name)
    }

    return Country;
  }])

  module.factory('Modifier', [
    function(){
      var self = this;
      angular.extend(self, {

      })
    }])

})();