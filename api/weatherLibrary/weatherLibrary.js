// const WEATHER_TIP_LIBRARY = [
//   // Rain-related tips
//   { condition: "rain", threshold: 10, tip: "Light rain expected: reduce irrigation for the day." },
//   { condition: "rain", threshold: 30, tip: "Moderate rain expected: skip watering your crops." },
//   { condition: "rain", threshold: 60, tip: "Heavy rain expected: cover sensitive crops or postpone planting." },
//   { condition: "storm", threshold: 70, tip: "Stormy weather: secure greenhouses and fragile plants." },
  
//   // Heat-related tips
//   { condition: "hot", threshold: 30, tip: "High temperature: water crops frequently during the day." },
//   { condition: "hot", threshold: 35, tip: "Extreme heat: provide shade for sensitive seedlings." },
  
//   // Cold/frost-related tips
//   { condition: "cold", threshold: 5, tip: "Low temperature: protect seedlings from frost." },
//   { condition: "cold", threshold: 0, tip: "Freezing temperature: consider frost blankets for crops." },
  
//   // Wind-related tips
//   { condition: "wind", threshold: 10, tip: "Low wind: ideal for spraying crops." },
//   { condition: "wind", threshold: 30, tip: "Strong wind: secure fragile crops and equipment." },
  
//   // Humidity-related tips
//   { condition: "humidity", threshold: 80, tip: "High humidity: monitor for fungal infections." },
//   { condition: "humidity", threshold: 30, tip: "Low humidity: increase irrigation to prevent plant stress." },
  
//   // UV Index
//   { condition: "uv", threshold: 6, tip: "High UV index: consider shading delicate crops." },
  
//   // Visibility
//   { condition: "visibility", threshold: 2, tip: "Low visibility: postpone pesticide spraying." },
  
//   // Daily combinations
//   { condition: "hot+dry", threshold: 30, tip: "Hot and dry conditions: water crops early morning and late afternoon." },
//   { condition: "rain+wind", threshold: 50, tip: "Rainy and windy day: secure crops and avoid spraying." },
//   { condition: "storm+rain", threshold: 70, tip: "Storm expected: move potted plants indoors." },
//   { condition: "cold+dry", threshold: 5, tip: "Cold and dry: consider frost protection and water management." },
  
//   // More diverse tips (examples)
//   { condition: "sunny", threshold: 20, tip: "Sunny day: ideal for planting seeds outdoors." },
//   { condition: "cloudy", threshold: 0, tip: "Cloudy day: good for transplanting seedlings." },
//   { condition: "rain+humidity", threshold: 60, tip: "Rainy and humid: inspect crops for mold." },
//   { condition: "wind+dry", threshold: 15, tip: "Windy and dry: avoid spraying chemicals today." },
//   { condition: "rain+uv", threshold: 30, tip: "Rain with moderate UV: protect seedlings after watering." },
  
//   // More creative tips
//   { condition: "frost", threshold: 2, tip: "Frost risk: cover delicate crops overnight." },
//   { condition: "fog", threshold: 1, tip: "Foggy morning: postpone pesticide spraying." },
//   { condition: "hail", threshold: 50, tip: "Hail warning: protect crops or move them under cover." },
//   { condition: "heatwave", threshold: 38, tip: "Heatwave: ensure irrigation systems are running efficiently." },
//   { condition: "drought", threshold: 5, tip: "Drought conditions: implement water-saving techniques." },
//   { condition: "highwinds", threshold: 35, tip: "High winds: stake plants and protect greenhouse structures." },
//   { condition: "humidity+heat", threshold: 75, tip: "Hot and humid: monitor crops for pests and fungal growth." },
//   { condition: "lowtemp+humidity", threshold: 40, tip: "Chilly and humid: consider using covers for frost-sensitive plants." },
  
//   // Fill to reach 50+ tips with creative combinations
//   { condition: "rain+cold", threshold: 50, tip: "Rainy and cold: avoid planting new seedlings today." },
//   { condition: "sunny+wind", threshold: 15, tip: "Sunny with light wind: perfect for fertilizing." },
//   { condition: "storm+humidity", threshold: 60, tip: "Stormy and humid: check drainage to prevent waterlogging." },
//   { condition: "heat+wind", threshold: 30, tip: "Hot and windy: water crops thoroughly in early morning." },
//   { condition: "rain+uv+humidity", threshold: 50, tip: "Rainy, sunny, and humid: balance irrigation and cover seedlings." },
//   { condition: "hot+uv", threshold: 35, tip: "High UV with heat: shade sensitive crops to prevent sunburn." },
//   { condition: "cold+wind", threshold: 5, tip: "Cold and windy: protect seedlings from desiccation." },
//   { condition: "hot+dry+wind", threshold: 30, tip: "Hot, dry, and windy: irrigate in early morning and evening." },
//   { condition: "rain+storm+wind", threshold: 70, tip: "Severe storm expected: protect crops and remove loose objects." },
//   { condition: "fog+humidity", threshold: 2, tip: "Foggy and humid: check for mold on plants." },
//   { condition: "heatwave+uv", threshold: 38, tip: "Extreme heat and UV: provide extra shade and water frequently." },
//   { condition: "drought+wind", threshold: 5, tip: "Dry and windy: use drip irrigation to conserve water." },
//   { condition: "rain+hail", threshold: 50, tip: "Rain and hail: cover crops and delay planting." },
//   { condition: "storm+heat", threshold: 35, tip: "Storm expected on a hot day: secure all plants and equipment." },
// ];
// utils/weatherTips.js

export const WEATHER_TIP_LIBRARY = [
  // Rain
  { condition: "rain", threshold: 5, tip: "Light rain expected: reduce irrigation today.", severity: "low", emoji: "🌦️" },
  { condition: "rain", threshold: 15, tip: "Moderate rain expected: skip watering crops.", severity: "medium", emoji: "🌧️" },
  { condition: "rain", threshold: 40, tip: "Heavy rain expected: cover sensitive crops.", severity: "high", emoji: "⛈️" },
  { condition: "rain", threshold: 60, tip: "Stormy rain: postpone planting and secure seedlings.", severity: "high", emoji: "🌧️" },
  { condition: "rain", threshold: 80, tip: "Extreme rain: monitor soil erosion and protect seedlings.", severity: "high", emoji: "🌊" },

  // Storm
  { condition: "storm", threshold: 50, tip: "Strong storm expected: secure greenhouses.", severity: "high", emoji: "🌪️" },
  { condition: "storm", threshold: 70, tip: "Severe storm alert: move crops indoors if possible.", severity: "high", emoji: "🌀" },

  // Hot / Sunny
  { condition: "hot", threshold: 28, tip: "Warm day: water crops regularly.", severity: "low", emoji: "☀️" },
  { condition: "hot", threshold: 32, tip: "Hot day: ensure seedlings get shade.", severity: "medium", emoji: "🌞" },
  { condition: "hot", threshold: 36, tip: "Extreme heat: avoid fertilizing today, water frequently.", severity: "high", emoji: "🔥" },
  { condition: "hot", threshold: 40, tip: "Heatwave alert: consider temporary shading or cooling irrigation.", severity: "high", emoji: "🥵" },

  // Cold / Frost
  { condition: "cold", threshold: 10, tip: "Cool day: monitor seedlings for frost stress.", severity: "low", emoji: "🧊" },
  { condition: "cold", threshold: 5, tip: "Low temperature: protect crops with covers.", severity: "medium", emoji: "🥶" },
  { condition: "cold", threshold: 0, tip: "Freezing alert: use frost blankets for sensitive crops.", severity: "high", emoji: "❄️" },
  { condition: "cold", threshold: -5, tip: "Extreme frost: delay planting until conditions improve.", severity: "high", emoji: "🧊" },

  // Wind
  { condition: "wind", threshold: 5, tip: "Calm wind: perfect for spraying crops.", severity: "low", emoji: "🌬️" },
  { condition: "wind", threshold: 15, tip: "Moderate wind: secure lightweight equipment.", severity: "medium", emoji: "💨" },
  { condition: "wind", threshold: 25, tip: "Strong wind: avoid spraying or planting.", severity: "high", emoji: "🌪️" },
  { condition: "wind", threshold: 35, tip: "Extreme wind: secure greenhouses and fragile plants.", severity: "high", emoji: "🌀" },

  // UV Index
  { condition: "uv", threshold: 3, tip: "Low UV: good day for outdoor work.", severity: "low", emoji: "🕶️" },
  { condition: "uv", threshold: 6, tip: "Moderate UV: protect seedlings from sunburn.", severity: "medium", emoji: "🕶️" },
  { condition: "uv", threshold: 8, tip: "High UV: avoid working in direct sun, use shading.", severity: "high", emoji: "🌞" },
  { condition: "uv", threshold: 11, tip: "Extreme UV: protect crops and yourself, minimize outdoor exposure.", severity: "high", emoji: "☀️" },

  // Humidity
  { condition: "humidity", threshold: 30, tip: "Low humidity: increase irrigation to prevent wilting.", severity: "medium", emoji: "💧" },
  { condition: "humidity", threshold: 50, tip: "Moderate humidity: ideal for crop growth.", severity: "low", emoji: "🌱" },
  { condition: "humidity", threshold: 70, tip: "High humidity: monitor for fungal diseases.", severity: "medium", emoji: "💦" },
  { condition: "humidity", threshold: 90, tip: "Very high humidity: protect crops from mold.", severity: "high", emoji: "🌧️" },

  // General farming tips
  { condition: "general", threshold: 0, tip: "Check irrigation systems today.", severity: "low", emoji: "💧" },
  { condition: "general", threshold: 0, tip: "Inspect farming tools and machinery.", severity: "low", emoji: "🔧" },
  { condition: "general", threshold: 0, tip: "Monitor crop growth and remove weeds.", severity: "low", emoji: "🌾" },
  { condition: "general", threshold: 0, tip: "Check for pests and apply treatment if necessary.", severity: "medium", emoji: "🐛" },
  { condition: "general", threshold: 0, tip: "Harvest crops that are ready to avoid spoilage.", severity: "low", emoji: "🌻" },
  { condition: "general", threshold: 0, tip: "Rotate crops to maintain soil fertility.", severity: "low", emoji: "🌱" },
  { condition: "general", threshold: 0, tip: "Use compost or mulch to retain soil moisture.", severity: "low", emoji: "🪴" },
  { condition: "general", threshold: 0, tip: "Test soil pH and adjust as needed.", severity: "low", emoji: "🧪" },
  { condition: "general", threshold: 0, tip: "Monitor irrigation scheduling to save water.", severity: "low", emoji: "💧" },
  { condition: "general", threshold: 0, tip: "Check for signs of nutrient deficiency.", severity: "medium", emoji: "🥬" },
  { condition: "general", threshold: 0, tip: "Prune plants for better growth and airflow.", severity: "low", emoji: "✂️" },
  { condition: "general", threshold: 0, tip: "Ensure drainage channels are clear.", severity: "low", emoji: "🚿" },
  { condition: "general", threshold: 0, tip: "Monitor for fungal infections after rain.", severity: "medium", emoji: "🍄" },
  { condition: "general", threshold: 0, tip: "Avoid overwatering seedlings.", severity: "medium", emoji: "💧" },
  { condition: "general", threshold: 0, tip: "Apply organic fertilizers when suitable.", severity: "low", emoji: "🪴" },
  { condition: "general", threshold: 0, tip: "Use windbreaks if area is prone to strong gusts.", severity: "medium", emoji: "🌬️" },
  { condition: "general", threshold: 0, tip: "Keep farm pathways clean and clear.", severity: "low", emoji: "🛤️" },
  { condition: "general", threshold: 0, tip: "Check water pumps and irrigation lines for leaks.", severity: "low", emoji: "💧" },
  { condition: "general", threshold: 0, tip: "Maintain compost piles for nutrient-rich soil.", severity: "low", emoji: "🌱" },
  { condition: "general", threshold: 0, tip: "Observe plant growth stages for optimal care.", severity: "low", emoji: "👀" },
  { condition: "general", threshold: 0, tip: "Keep records of weather and crop conditions.", severity: "low", emoji: "📝" },
  { condition: "general", threshold: 0, tip: "Plan crop rotations to prevent soil depletion.", severity: "low", emoji: "🌾" },
  { condition: "general", threshold: 0, tip: "Monitor for pest migration after storms.", severity: "medium", emoji: "🐜" },
  { condition: "general", threshold: 0, tip: "Use shade nets for heat-sensitive plants.", severity: "medium", emoji: "🟨" },
];

