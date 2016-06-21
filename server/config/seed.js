/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Donor from '../api/donor/donor.model';

Donor.find({}).remove()
  .then(() => {
    Donor.create([
      {
        firstName: "Emilio", 
        lastName: "Aguinaldo", 
        email: "eaguinaldo@president.gov", 
        contactNum: "+121212121212", 
        bloodGroup: "A", address: "Cavite, Calabarzon, Philippines", 
        location: { 
          coordinates: [120.8932181310006, 14.477826570000442], 
          type: "Point" }
      },
      { 
        firstName: "Jose", 
        lastName: "Rizal", 
        email: "jrizal@nathero.com", 
        contactNum: "+111111111111", 
        bloodGroup: "B", 
        address: "Calamba, Calabarzon, Philippines", 
        location: { 
          coordinates: [121.16527748900059, 14.21166618900042], 
          type: "Point" 
        }
      },
      { 
        firstName: "Andres", 
        lastName: "Bonifacio", 
        email: "abonifacio@hero.kkk", 
        contactNum: "+999999999999", 
        bloodGroup: "AB", 
        address: "Don Bosco Tondo Manila - C. P. Garcia, Manila", 
        location: { 
          coordinates: [120.96151757000054, 14.61547835500045], 
          type: "Point" 
        }
      },
      { 
        firstName: "Marcelo", 
        lastName: "del Pilar", 
        email: "mhdelpilar@plaridel.com", 
        contactNum: "+222222222222", 
        bloodGroup: "O", 
        address: "F. Mali, Tibig, Bulacan, Bulacan, Central Luzon", 
        location: { 
          coordinates: [120.88108146700053, 14.78684326400042], 
          type: "Point" 
        }
      },
      { 
        firstName: "Juan", 
        lastName: "Luna", 
        email: "jluna@artist.com", 
        contactNum: "+333333333333", 
        bloodGroup: "A", 
        address: "Ilocos Norte National High School Science and Technology Engineering Program - P. Hernando St, Laoag City", 
        location: { 
          coordinates: [120.59102944700055, 18.205385795000428], 
          type: "Point" 
        }
      },
      { 
        firstName: "Apolinario", 
        lastName: "Mabini", 
        email: "amabini@primeminister.gov", 
        contactNum: "+444444444444", 
        bloodGroup: "B", 
        address: "Tanauan, Calabarzon, Philippines", 
        location: { 
          coordinates: [121.14974936700058, 14.086266816000444], 
          type: "Point" 
        }
      },
      { 
        firstName: "Melchora", 
        lastName: "Aquino", 
        email: "tandangsora@hero.gov", 
        contactNum: "+555555555555", 
        bloodGroup: "AB", 
        address: "Caloocan, National Capital Region, Philippines", 
        location: { 
          coordinates: [120.98332713500054, 14.65332899600044], 
          type: "Point" 
        }
      },
      { 
        firstName: "Gabriela", 
        lastName: "Silang", 
        email: "gsilang@hero.ph", 
        contactNum: "+776754545457", 
        bloodGroup: "O", 
        address: "Vigan, Ilocos, Philippines", 
        location: { 
          coordinates: [120.38693655800057, 17.57471725900047], 
          type: "Point" 
        }
      }
    ]);
  });

