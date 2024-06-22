import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/vercel";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: "edge",
// };

function hexToHexAlpha(hex, alpha) {
  // Remove the hash sign if present
  hex = hex.replace(/^#/, "");

  // Ensure alpha is within the valid range
  alpha = Math.round(Math.min(Math.max(0, alpha), 1) * 255);

  // Append the alpha value to the hex color code
  return `#${hex}${alpha.toString(16).padStart(2, "0")}`;
}

async function fetchDataAndFindSlug(slugName) {
  try {
    // Construct the URL with the provided slug name
    const url = `https://api.bracket.game/trpc/collective.getPrices?batch=1&input=%7B%220%22%3A%7B%22contract%22%3A%22euro24%22%2C%22currency%22%3A%22USDC%22%7D%7D`;

    // Fetch data from the URL
    const response = await fetch(url);
    const jsonData = await response.json();

    // console.log("Fetched Data:", jsonData); // Log the fetched data

    // Initialize matching slug and voteCount
    let matchingSlug;
    let voteCount;

    // Check if the data and json properties exist in the result
    if (jsonData.length > 0 && jsonData[0].result && jsonData[0].result.data) {
      const data = jsonData[0].result.data;
      // Check if the data object has a json property and it's an array
      if (data.json && Array.isArray(data.json)) {
        // Iterate over the json array
        for (const item of data.json) {
          if (item.slug === slugName) {
            matchingSlug = item.slug;
            voteCount = item.voteCount / 100;
            break;
          }
        }
      }
    }

    // Log or return the matching slug and voteCount
    // console.log("Matching Slug:", matchingSlug);
    // console.log("Vote Count:", voteCount);
    return { slug: matchingSlug, voteCount };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Call the function with the desired slug name
// fetchDataAndFindSlug("bucks-nation");

function newShade(hexColor: string, magnitude: number): string {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16);
    let r = (decimalColor >> 16) + magnitude;
    r > 255 && (r = 255);
    r < 0 && (r = 0);
    let g = (decimalColor & 0x0000ff) + magnitude;
    g > 255 && (g = 255);
    g < 0 && (g = 0);
    let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
    b > 255 && (b = 255);
    b < 0 && (b = 0);
    return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
  } else {
    return hexColor;
  }
}

function getSlugByAcronym(ShortName: string) {
  const data = {
    result: {
      data: {
        json: [
          { acronym: "FRA", slug: "les-bleus" },
          { acronym: "GER", slug: "die-mannschaft" },
          { acronym: "ESP", slug: "la-furia-roja" },
          { acronym: "ENG", slug: "the-three-lions" },
          { acronym: "POR", slug: "a-selecao" },
          { acronym: "NED", slug: "oranje" },
          { acronym: "BEL", slug: "the-red-devils" },
          { acronym: "ITA", slug: "gli-azzurri" },
          { acronym: "TUR", slug: "the-crescent-stars" },
          { acronym: "DEN", slug: "danish-dynamite" },
          { acronym: "AUT", slug: "das-nationalteam" },
          { acronym: "SVK", slug: "the-falcons" },
          { acronym: "UKR", slug: "the-blue-yellows" },
          { acronym: "ROU", slug: "tricolorii" },
          { acronym: "SUI", slug: "a-team" },
          { acronym: "CRO", slug: "kockasti" },
          { acronym: "SRB", slug: "the-eagles" },
          { acronym: "SCO", slug: "the-tartan-army" },
          { acronym: "HUN", slug: "magical-magyars" },
          { acronym: "POL", slug: "the-white-reds" },
          { acronym: "ALB", slug: "the-red-&-blacks" },
          { acronym: "SVK", slug: "the-boys" },
          { acronym: "GEO", slug: "the-crusaders" },
          { acronym: "CZE", slug: "narodak" },
        ],
      },
    },
  };

  // Find matching acronym and return corresponding slug
  const match = data.result.data.json.find(
    (item) => item.acronym === ShortName
  );
  return match ? match.slug : null;
}

// Function to fetch data from ESPN API
async function fetchESPNData(i: number) {
  try {
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/UEFA.euro/scoreboard"
    );
    const data = await response.json();
    // Use ESPN data to populate the frame
    // Extract information about the next game
    const events = data.events;
    const length = events.length;
    // const randomIndex = Math.floor(Math.random() * length);
    const nextGame = events[i]; // Assuming the first event is the next game

    // Extract relevant information
    const homeTeamData = nextGame.competitions[0].competitors[0].team;
    const awayTeamData = nextGame.competitions[0].competitors[1].team;
    // const homeTeamLogoUrl = homeTeamData.logo;
    // const awayTeamLogoUrl = awayTeamData.logo;
    const homeTeam = homeTeamData.shortDisplayName;
    const awayTeam = awayTeamData.shortDisplayName;
    const homeTeamShort = homeTeamData.abbreviation;
    const awayTeamShort = awayTeamData.abbreviation;
    // const homeTeamAlt = homeTeamData.alternateColor;
    const homeTeamLogo = homeTeamData.logo;
    const awayTeamLogo = awayTeamData.logo;

    let homeTeamColor = homeTeamData.color;
    let awayTeamColor = awayTeamData.color;
    let awayTeamAlt = newShade(awayTeamData.alternateColor, 20);
    let homeTeamAlt = newShade(homeTeamData.alternateColor, 20);

    const homeBG = hexToHexAlpha(homeTeamColor, 0.49);
    const awayBG = hexToHexAlpha(awayTeamColor, 0.49);

    let broadcastName = "";
    if (
      nextGame &&
      nextGame.competitions &&
      nextGame.competitions[0] &&
      nextGame.competitions[0].broadcasts &&
      nextGame.competitions[0].broadcasts[0] &&
      nextGame.competitions[0].broadcasts[0].names &&
      nextGame.competitions[0].broadcasts[0].names.length > 0
    ) {
      broadcastName = nextGame.competitions[0].broadcasts[0].names[0];
    }
    let headline = "";
    if (
      nextGame.competitions &&
      nextGame.competitions[0] &&
      nextGame.competitions[0].notes &&
      nextGame.competitions[0].notes[0] &&
      nextGame.competitions[0].notes[0].headline
    ) {
      headline = nextGame.competitions[0].notes[0].headline;
    }

    let seriesNotes = "";
    if (
      nextGame.competitions &&
      nextGame.competitions[0] &&
      nextGame.competitions[0].series &&
      nextGame.competitions[0].series.summary
    ) {
      seriesNotes = nextGame.competitions[0].series.summary;
    }

    const gameTime = new Date(nextGame.date);
    const formattedDayAndTime = () => {
      // Create a new Date object for the current date and time
      const today = new Date();

      const checkDay = today.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      });

      // console.log(checkDay);

      const gametimeSimple = gameTime.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      });
      // console.log(gametimeSimple);

      if (checkDay === gametimeSimple) {
        return `${headline.slice(-6)} ${gameTime.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "America/New_York",
        })} ET`;
      } else {
        return `${gameTime.toLocaleString("en-US", {
          weekday: "long",
          timeZone: "America/New_York",
        })} ${gameTime.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "America/New_York",
        })} ET`;
      }
    };
    const gameDay = formattedDayAndTime();
    const homeTeamScore = nextGame.competitions[0].competitors[0].score;
    const awayTeamScore = nextGame.competitions[0].competitors[1].score;
    const gameState = nextGame.status.type.state;
    const homeSlug = getSlugByAcronym(homeTeamShort);
    const awaySlug = getSlugByAcronym(awayTeamShort);
    const homeTeamBracketData = await fetchDataAndFindSlug(homeSlug);
    const homeTeamPrice = homeTeamBracketData?.voteCount;
    const awayTeamBracketData = await fetchDataAndFindSlug(awaySlug);
    const awayTeamPrice = awayTeamBracketData?.voteCount;

    let clock;
    let oddsDetails = "";

    if (gameState === "pre") {
      // Extract odds details if available
      clock = gameDay.toUpperCase();
      if (
        nextGame &&
        nextGame.competitions &&
        nextGame.competitions[0] &&
        nextGame.competitions[0].odds &&
        nextGame.competitions[0].odds[0]
      ) {
        oddsDetails = nextGame.competitions[0].odds[0].details;
      }
    } else if (gameState === "post") {
      clock = seriesNotes.toUpperCase();
    } else {
      clock = nextGame.status.type.detail.toUpperCase();
    }
    return {
      length,
      homeTeam,
      awayTeam,
      homeTeamShort,
      awayTeamShort,
      homeTeamColor,
      awayTeamColor,
      homeTeamAlt,
      awayTeamAlt,
      broadcastName,
      gameTime,
      gameDay,
      homeTeamScore,
      awayTeamScore,
      gameState,
      oddsDetails,
      clock,
      homeSlug,
      awaySlug,
      homeBG,
      awayBG,
      homeTeamPrice,
      awayTeamPrice,
      headline,
      seriesNotes,
      homeTeamLogo,
      awayTeamLogo,
    };
  } catch (error) {
    console.error("Error fetching ESPN data:", error);
    return null;
  }
}

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  browserLocation: "/",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.frame("/", (c) => {
  // const { buttonValue, status } = c;
  return c.res({
    action: "/0",
    image: (
      <div
        style={{
          alignItems: "center",
          background: "#D4E3EA",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <img
          alt="Home Team"
          height={400}
          src="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/74.png"
          style={{ margin: "0 2px" }}
          width={400}
        />
        <div
          style={{
            color: "#0952A1",
            fontSize: 100,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 0,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
            fontWeight: "bold",
            fontFamily: "ui-sans-serif,system-ui,sans-serif",
          }}
        >
          Scoreboard
        </div>
      </div>
    ),
    intents: [<Button value="next">View Games</Button>],
  });
});
const games = await fetchESPNData(0);
for (let i = 0; i < games?.length; i++) {
  app.frame(`/${i}`, async (c) => {
    // const { buttonValue } = c;
    const espnData = await fetchESPNData(i);
    console.log(espnData);
    // Define the action for the "back" button
    // let backAction = i > 0 ? `/${i - 1}` : `/`;
    // Define the action for the "next" button
    let nextAction = i < espnData?.length - 1 ? `/${i + 1}` : null;
    let homeSlug = espnData?.homeSlug;
    let awaySlug = espnData?.awaySlug;
    // const leftArrow = "\u2190"; // Left arrow ←
    const rightArrow = "\u2192";
    // Example usage:
    return c.res({
      // action: action,
      image: (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            backgroundImage: `linear-gradient(to right top, ${espnData?.homeBG}, ${espnData?.awayBG})`,
            fontSize: 62,
            fontWeight: 900,
            color: "black",
            fontFamily: '"Inter"',
          }}
        >
          <div style={{ marginBottom: 85 }}>{espnData?.clock}</div>
          <div
            style={{
              height: "40%",
              width: "80%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                height: "400px",
                width: "400px",
                borderRadius: "50%",
                backgroundColor: `#${espnData?.homeTeamColor}`,
                border: `${espnData?.homeTeamAlt} 8px`,
                display: "flex",
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: 'Inter, "Inter", sans-serif',
              }}
            >
              {espnData?.gameState === "pre" ? (
                <span
                  style={{
                    fontSize: "130px",
                    color: espnData?.homeTeamAlt,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  {espnData?.homeTeamShort}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "160px",
                    color: espnData?.homeTeamAlt,
                    textAlign: "center",
                  }}
                >
                  {espnData?.homeTeamScore}
                </span>
              )}
            </div>
            <div
              style={{
                height: "400px",
                width: "400px",
                borderRadius: "50%",
                backgroundColor: `#${espnData?.awayTeamColor}`,
                border: `${espnData?.awayTeamAlt} 8px`,
                backgroundSize: "cover",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                fontFamily: 'Inter, "Inter", sans-serif',
              }}
            >
              {espnData?.gameState === "pre" ? (
                <span
                  style={{
                    fontSize: "130px",
                    color: espnData?.awayTeamAlt,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  {espnData?.awayTeamShort}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "160px",
                    color: espnData?.awayTeamAlt,
                    textAlign: "center",
                  }}
                >
                  {espnData?.awayTeamScore}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: 75,
              display: "flex",
              width: "65%",
              flexDirection: "row",
              alignItems: "stretch",
              textAlign: "center",
              justifyContent: "space-between",
            }}
          >
            <span>↑ {espnData?.homeTeamPrice}</span>
            <span>↑ {espnData?.awayTeamPrice}</span>
          </div>
        </div>
      ),
      intents: [
        <Button.Link href={`https://bracket.game/euro24/${homeSlug}`}>
          {" "}
          {espnData?.homeTeam}
        </Button.Link>,
        <Button.Link href={`https://bracket.game/euro24/${awaySlug}`}>
          {" "}
          {espnData?.awayTeam}
        </Button.Link>,
        // <Button value="back" action={backAction}>
        //   {leftArrow}
        // </Button>,
        nextAction ? (
          <Button value="next" action={nextAction}>
            {rightArrow}
          </Button>
        ) : (
          <Button.Reset>Start Over</Button.Reset>
        ),
      ].filter(Boolean),
    });
  });
}
if (import.meta.env?.MODE === "development") devtools(app, { serveStatic });
else devtools(app, { assetsPath: "/.frog" });

export const GET = handle(app);
export const POST = handle(app);
