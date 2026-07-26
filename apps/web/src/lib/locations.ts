export interface LocationFaqEntry {
  question: string;
  answer: string;
}

export interface LocationRecord {
  slug: string;
  name: string;
  metaDescription: string;
  intro: string;
  paragraphs: string[];
  industrialAreas: string[];
  faq: LocationFaqEntry[];
}

// Real cities only — deliberately scoped to exactly the three we serve. Adding a
// fourth city here means writing another ~600 words of real, specific content
// for it, not copying this file and swapping a name (see docs/DECISIONS.md).
export const locations: LocationRecord[] = [
  {
    slug: "kitchener",
    name: "Kitchener",
    metaDescription:
      "Same-day, rush, overnight and scheduled courier service across Kitchener, with direct runs to Waterloo and Cambridge.",
    intro:
      "Kitchener is the largest of the three cities we run, and most of our Kitchener pickups either stay inside the city or cross over to Waterloo along King Street and the ION corridor.",
    paragraphs: [
      "Downtown Kitchener is dense enough that a lot of same-day business here is short-hop: a document from an office tower near Kitchener City Hall to a law firm a few blocks over, or a part from a supplier near the Charles Street Transit Terminal to a shop on the other side of downtown. Traffic downtown moves slowly at rush hour, which is exactly why a scanned, timestamped run matters more than a guess at drive time.",
      "The Innovation District around King Street West and the old Breithaupt Block has become one of the busiest pickup zones we see, home to a mix of tech offices and converted industrial buildings that still need physical things moved between them: signed contracts, hardware, prototypes. It sits close enough to Uptown Waterloo that a Kitchener-to-Waterloo run along that corridor is typically one of our fastest crossings, often well under twenty minutes outside of peak traffic.",
      "Further out, Kitchener's industrial and light-manufacturing base runs along Victoria Street North, Homer Watson Boulevard, and the Highway 7/8 (Conestoga Parkway) corridor toward Highway 401, which is reachable from most of Kitchener in roughly fifteen to twenty-five minutes depending on where the run starts. That stretch is where we see the most Rush bookings: a machine shop waiting on one part, a warehouse that's short a pallet before a truck leaves.",
      "Fairview Park Mall and the retail strip around Highway 8 is another cluster we run regularly, mostly Same Day and Scheduled work moving stock or paperwork between retail locations and back-office addresses elsewhere in the region. Whatever the address, the same rule applies everywhere in Kitchener: a scan at pickup, a scan at the depot, a scan at the door.",
      "South Kitchener, around Doon and Conestoga College's main campus, is quieter but not idle: a steady trickle of Scheduled and Same Day pickups tied to the college itself and the smaller light-industrial businesses that have grown up along Homer Watson Boulevard toward the Cambridge boundary. It's also one of the more direct paths into Cambridge when a run needs to skip downtown traffic entirely.",
      "Downtown Kitchener's one-way street grid around King and Queen is worth knowing about if you've ever tried to load a vehicle there yourself: a wrong turn can cost five extra minutes just circling back. Drivers who run Kitchener regularly build that into their timing rather than treating every downtown stop like a suburban one, and winter weather on the Conestoga Parkway adds its own seasonal slowdown that we account for rather than promise around.",
      "Kitchener Market and Victoria Park anchor the older part of downtown and stay busy with small retail and office pickups year-round. The one week that changes everything downtown is Oktoberfest in mid-October, when street closures around the core slow every route through the city, Kitchener and Waterloo both. It's the one predictable exception to our usual timing, and we plan routes around it rather than promise the same speed we run the rest of the year.",
      "Which tier makes sense in Kitchener usually comes down to which part of the city you're in. Same Day covers most downtown-to-downtown and downtown-to-Waterloo work comfortably. Rush earns its cost on the industrial corridors, Victoria Street, Homer Watson, where a stalled production line or a missed pickup window is expensive enough that an hour matters. Scheduled fits the businesses in Fairview or Doon that move the same kind of shipment on the same kind of timeline every week.",
    ],
    industrialAreas: [
      "Innovation District / Breithaupt Block",
      "Victoria Street North",
      "Homer Watson Boulevard",
      "Fairview Park area",
      "Doon / Conestoga College area",
    ],
    faq: [
      {
        question: "How fast can something get from Kitchener to Waterloo?",
        answer:
          "Most Kitchener-to-Waterloo runs along the King Street/ION corridor take well under twenty minutes outside of peak traffic. For anything time-critical, Rush sends a driver directly instead of working it into a wider route.",
      },
      {
        question: "Do you cover the industrial areas along Victoria Street and Homer Watson?",
        answer:
          "Yes, that corridor toward Highway 401 is one of our regular Kitchener routes and where most of our Rush bookings for manufacturing and warehouse pickups come from.",
      },
      {
        question: "Do you serve south Kitchener, near Conestoga College?",
        answer:
          "Yes. The Doon area and the light-industrial businesses along Homer Watson Boulevard toward Cambridge are a regular part of our Kitchener coverage.",
      },
    ],
  },
  {
    slug: "waterloo",
    name: "Waterloo",
    metaDescription:
      "Courier pickups and deliveries across Waterloo, from Uptown to the Northfield business park, with direct runs to Kitchener and Cambridge.",
    intro:
      "Waterloo is compact but dense with exactly the kind of businesses that generate steady courier demand: universities, tech offices, and research parks that all need documents and hardware moved between buildings that are close together but not walkable with a hand truck.",
    paragraphs: [
      "The University of Waterloo and Wilfrid Laurier University sit at the center of a lot of what we move here: signed agreements between departments, equipment between labs, materials for events. Both campuses back onto the David Johnston Research and Technology Park, which has grown into one of the busiest tech clusters in the region and is a regular Same Day and Rush pickup zone for us.",
      "Uptown Waterloo, along King Street and Erb Street, is the other core we run constantly. It's a mix of professional offices, small retail, and the kind of businesses that need something at a client's door within the hour rather than by end of day, which is where Rush earns its keep. Parking and loading in Uptown can be tight during business hours, and a driver who already knows the block saves real time over one who doesn't.",
      "North of the core, the Northfield Drive business park is Waterloo's other major cluster: a dense strip of tech and professional offices that grew up around the city's tech industry reputation. It's a common Scheduled route for us, since a lot of businesses there have a standing need to move documents or equipment to a Kitchener or Cambridge office on the same day each week rather than a one-off request.",
      "Waterloo connects to Kitchener along the same King Street/ION corridor Kitchener runs use, which keeps cross-city same-day work fast and predictable. Getting to Cambridge takes longer, typically thirty to forty minutes depending on the exact pickup point and route, which is worth knowing if you're deciding between Same Day and Rush for a Waterloo-to-Cambridge run with a hard deadline.",
      "Conestoga Mall and the retail cluster along Weber Street in the city's north end is another area we run often, mostly Same Day work moving stock between retail locations and back offices elsewhere in the region. It's a shorter, more predictable route than the Uptown core, without the tight downtown parking to work around.",
      "Waterloo's tech reputation didn't come from nowhere: the city grew up around a run of technology employers that followed the university, and a lot of that same infrastructure, dense office space, tight timelines, documents that need a real signature, is still what drives our Rush bookings here. Winter is the one variable that changes things every year: heavier snow on Northfield Drive and around the business park can add real time to a route that runs fine the other ten months, and we plan around that rather than pretend it away.",
      "Belmont Village and the streets around it southwest of Uptown are a smaller but steady commercial strip we run, mostly small offices and retail. And like Kitchener, Waterloo slows down for Oktoberfest each October, since the festival's street closures and crowds spill across both cities rather than staying contained to one downtown core. We treat that week as its own case, not a normal Tuesday.",
      "The tier that fits depends on where in Waterloo you're starting from. Same Day covers the university-to-Uptown and university-to-Kitchener routes most businesses need day to day. Rush is what a law office on King Street or a lab that just found out it's missing a part actually books, since the whole point is skipping the wait. Scheduled tends to come from the tech offices around Northfield Drive that need the same document or equipment move to happen on the same day every week without rebooking it each time.",
    ],
    industrialAreas: [
      "David Johnston Research and Technology Park",
      "Northfield Drive business park",
      "Uptown Waterloo core",
      "Conestoga Mall / Weber Street retail area",
    ],
    faq: [
      {
        question: "Can you make a pickup on campus at the University of Waterloo or Laurier?",
        answer:
          "Yes, campus pickups and deliveries are a regular part of our Waterloo routes, including the surrounding David Johnston Research and Technology Park.",
      },
      {
        question: "How long does a Waterloo to Cambridge run take?",
        answer:
          "Typically thirty to forty minutes depending on the exact addresses and traffic. For a hard deadline on that route, Rush is usually the safer choice over Same Day.",
      },
      {
        question: "Do you run to the Conestoga Mall area?",
        answer: "Yes, the retail and back-office cluster along Weber Street in north Waterloo is a regular Same Day route for us.",
      },
    ],
  },
  {
    slug: "cambridge",
    name: "Cambridge",
    metaDescription:
      "Same-day, rush and scheduled courier runs across Cambridge, with the most direct Highway 401 access of the three cities we serve.",
    intro:
      "Cambridge was formed from three towns, Galt, Preston, and Hespeler, and still runs a bit like three separate cores connected by the Grand River, which matters for anyone estimating how long a cross-town pickup will take here. It's also the one city of the three where a delivery is as likely to be headed toward the 401 as it is to stay local.",
    paragraphs: [
      "Galt, the southern and largest of the three, is Cambridge's downtown: the Gaslight District and Southworks, a converted textile mill turned retail and office space, sit right in the core and generate a steady mix of Same Day and Rush bookings between offices and retail. Galt is also the closest of the three cores to Highway 401, which makes Cambridge, city-wide, the fastest of our three cities to reach the highway from almost any pickup point, usually inside fifteen minutes.",
      "That 401 access is a big part of why Cambridge carries more industrial and manufacturing traffic than Kitchener or Waterloo. Toyota Motor Manufacturing Canada operates a major plant here, and the surrounding supplier and logistics businesses along Fountain Street and the Highway 24/Hespeler Road corridor are some of our steadiest Scheduled and Rush customers: parts that can't wait for a production line, paperwork that has to move between a supplier and the plant same day.",
      "Preston and Hespeler, the other two historic cores, sit north of Galt and each have their own smaller business strips. A pickup that starts in Hespeler and ends in Galt is a genuine cross-town run, not a five-minute hop, which is why we route Cambridge jobs by which core they're actually in rather than treating the whole city as one zone. Hespeler in particular has grown into its own retail and light-commercial strip along Hespeler Road, distinct enough from Galt that treating the two as interchangeable would throw off any honest delivery estimate.",
      "Franklin Boulevard and Bishop Street are Cambridge's other main industrial corridors, running light manufacturing and warehouse space that regularly needs same-day parts runs or scheduled pickups. Getting from Cambridge to Kitchener or Waterloo typically takes twenty-five to forty minutes depending on which of the three cores a run starts in, which is worth factoring in when choosing between Same Day and Rush for anything with a tight deadline.",
      "Conestoga College also runs a campus in Cambridge, focused on trades and skilled-technology programs, and it generates its own small but steady stream of Same Day and Scheduled pickups, materials and paperwork moving between the campus and suppliers elsewhere in the region. The Grand River runs straight through the Galt core, and the riverside redevelopment around it has been steadily changing downtown traffic patterns over the past several years, which is another reason we route by core rather than by a single citywide estimate.",
      "Because Cambridge sits closest to the 401 of the three cities we serve, it's also where we see the most shipments passing through on their way somewhere outside the region entirely, a supplier drop-off timed to meet a long-haul carrier, a same-day part pulled off a truck at the Toyota plant. That through-traffic is part of why Rush and Scheduled make up a larger share of our Cambridge bookings than they do in Kitchener or Waterloo.",
      "In practice, that means Same Day still covers most of the retail and office traffic around Galt and the Gaslight District, but the manufacturing corridors along Fountain Street and Franklin Boulevard lean harder on Rush, where a delayed part has a real cost attached to it. Scheduled tends to come from the same supplier relationships that make Cambridge busier with 401 through-traffic in the first place: a fixed pickup, a fixed drop-off, running on a fixed day every week.",
    ],
    industrialAreas: [
      "Galt core / Gaslight District",
      "Fountain Street corridor",
      "Franklin Boulevard",
      "Hespeler and Preston business strips",
      "Conestoga College Cambridge campus",
    ],
    faq: [
      {
        question: "Is Cambridge really faster to Highway 401 than Kitchener or Waterloo?",
        answer:
          "Yes. Cambridge, particularly the Galt core, sits closest to Highway 401 of the three cities we serve, usually reachable in under fifteen minutes from most pickup points.",
      },
      {
        question: "Do you treat all of Cambridge as one delivery zone?",
        answer:
          "No. Cambridge is really three historic town centers, Galt, Preston and Hespeler, and a run between them is a genuine cross-town trip. We route Cambridge jobs based on which core the pickup and drop-off actually fall in.",
      },
      {
        question: "Can you handle a pickup tied to the Toyota plant or its suppliers?",
        answer:
          "Yes, supplier and manufacturing pickups around the Cambridge Toyota plant are a regular part of our Rush and Scheduled bookings here.",
      },
    ],
  },
];

export function getLocationBySlug(slug: string): LocationRecord | undefined {
  return locations.find((location) => location.slug === slug);
}
