// Built-in phrase categories. Each phrase's `segs` is an array of segments:
//   { t: "text", r: "furigana reading" }  — `r` is present only for kanji that need furigana.
export const CATS = [
  {
    id: "help", title: "Help", ja: "助け", icon: "🆘", accent: "#E24B4A",
    phrases: [
      { id:"h1", en:"Please help me", segs:[{t:"助",r:"たす"},{t:"けてください"}] },
      { id:"h2", en:"Call an ambulance", segs:[{t:"救急車",r:"きゅうきゅうしゃ"},{t:"を"},{t:"呼",r:"よ"},{t:"んでください"}] },
      { id:"h3", en:"Call the police", segs:[{t:"警察",r:"けいさつ"},{t:"を"},{t:"呼",r:"よ"},{t:"んでください"}] },
      { id:"h4", en:"Where is the toilet?", segs:[{t:"トイレはどこですか"}] },
      { id:"h5", en:"Where is the hospital?", segs:[{t:"病院",r:"びょういん"},{t:"はどこですか"}] },
      { id:"h6", en:"I'm lost", segs:[{t:"道",r:"みち"},{t:"に"},{t:"迷",r:"まよ"},{t:"いました"}] },
      { id:"h7", en:"My wallet was stolen", segs:[{t:"財布",r:"さいふ"},{t:"を"},{t:"盗",r:"ぬす"},{t:"まれました"}] },
      { id:"h8", en:"I don't understand Japanese well", segs:[{t:"日本語",r:"にほんご"},{t:"があまりわかりません"}] },
      { id:"h9", en:"I made a mistake, can you help?", segs:[{t:"間違",r:"まちが"},{t:"えました、"},{t:"助",r:"たす"},{t:"けていただけますか"}] },
      { id:"h10", en:"May I use your phone?", segs:[{t:"電話",r:"でんわ"},{t:"を"},{t:"使",r:"つか"},{t:"ってもいいですか"}] },
      { id:"h11", en:"May I wait here?", segs:[{t:"ここで"},{t:"待",r:"ま"},{t:"ってもいいですか"}] },
      { id:"h12", en:"May I ask a question?", segs:[{t:"質問",r:"しつもん"},{t:"してもいいですか"}] },
    ]
  },
  {
    id: "directions", title: "Directions", ja: "道案内", icon: "🗺️", accent: "#378ADD",
    phrases: [
      { id:"d1", en:"Where is the station?", segs:[{t:"駅",r:"えき"},{t:"はどこですか"}] },
      { id:"d2", en:"I want to go here", segs:[{t:"ここに"},{t:"行",r:"い"},{t:"きたいです"}] },
      { id:"d3", en:"Is it far?", segs:[{t:"遠",r:"とお"},{t:"いですか"}] },
      { id:"d4", en:"Can I walk there?", segs:[{t:"歩",r:"ある"},{t:"いて"},{t:"行",r:"い"},{t:"けますか"}] },
      { id:"d5", en:"Please turn right", segs:[{t:"右",r:"みぎ"},{t:"に"},{t:"曲",r:"ま"},{t:"がってください"}] },
      { id:"d6", en:"Please turn left", segs:[{t:"左",r:"ひだり"},{t:"に"},{t:"曲",r:"ま"},{t:"がってください"}] },
      { id:"d7", en:"Please go straight", segs:[{t:"まっすぐ"},{t:"行",r:"い"},{t:"ってください"}] },
      { id:"d8", en:"Where is the bus stop?", segs:[{t:"バス"},{t:"停",r:"てい"},{t:"はどこですか"}] },
      { id:"d9", en:"May I take a photo here?", segs:[{t:"写真",r:"しゃしん"},{t:"を"},{t:"撮",r:"と"},{t:"ってもいいですか"}] },
      { id:"d10", en:"May I enter here?", segs:[{t:"ここに"},{t:"入",r:"はい"},{t:"ってもいいですか"}] },
    ]
  },
  {
    id: "food", title: "Food", ja: "食事", icon: "🍜", accent: "#BA7517",
    phrases: [
      { id:"f1", en:"Menu please", segs:[{t:"メニューをください"}] },
      { id:"f2", en:"I'll have this", segs:[{t:"これをください"}] },
      { id:"f3", en:"The check please", segs:[{t:"お"},{t:"会計",r:"かいけい"},{t:"をください"}] },
      { id:"f4", en:"I have an allergy", segs:[{t:"アレルギーがあります"}] },
      { id:"f5", en:"I can't eat this", segs:[{t:"これが"},{t:"食",r:"た"},{t:"べられません"}] },
      { id:"f6", en:"What do you recommend?", segs:[{t:"おすすめは"},{t:"何",r:"なん"},{t:"ですか"}] },
      { id:"f7", en:"Water please", segs:[{t:"水",r:"みず"},{t:"をください"}] },
      { id:"f8", en:"Very delicious!", segs:[{t:"とても"},{t:"美味",r:"おい"},{t:"しいです"}] },
      { id:"f9", en:"Please don't make it spicy", segs:[{t:"辛",r:"から"},{t:"くしないでください"}] },
      { id:"f10", en:"Coffee please", segs:[{t:"コーヒーをください"}] },
      { id:"f11", en:"Americano please", segs:[{t:"アメリカーノをください"}] },
      { id:"f12", en:"Matcha latte please", segs:[{t:"抹茶",r:"まっちゃ"},{t:"ラテをください"}] },
      { id:"f13", en:"Hot please", segs:[{t:"ホットでください"}] },
      { id:"f14", en:"Iced please", segs:[{t:"アイスでください"}] },
      { id:"f15", en:"With soy milk inside", segs:[{t:"豆乳",r:"とうにゅう"},{t:"を"},{t:"入",r:"い"},{t:"れてください"}] },
      { id:"f16", en:"Soy milk on the side please", segs:[{t:"豆乳",r:"とうにゅう"},{t:"を"},{t:"別",r:"べつ"},{t:"でください"}] },
      { id:"f17", en:"Change milk to soy milk please", segs:[{t:"ミルクを"},{t:"豆乳",r:"とうにゅう"},{t:"に"},{t:"変",r:"か"},{t:"えてください"}] },
      { id:"f18", en:"One americano with soy milk on the side", segs:[{t:"アメリカーノを"},{t:"一",r:"ひと"},{t:"つ、"},{t:"豆乳",r:"とうにゅう"},{t:"を"},{t:"別",r:"べつ"},{t:"でください"}] },
      { id:"f19", en:"We don't eat meat", segs:[{t:"私",r:"わたし"},{t:"たちは"},{t:"肉",r:"にく"},{t:"を"},{t:"食",r:"た"},{t:"べません"}] },
      { id:"f20", en:"Is this vegetarian?", segs:[{t:"これはベジタリアン"},{t:"料理",r:"りょうり"},{t:"ですか"}] },
      { id:"f21", en:"No beef, pork or chicken — fish is ok", segs:[{t:"牛肉",r:"ぎゅうにく"},{t:"と"},{t:"豚肉",r:"ぶたにく"},{t:"と"},{t:"鶏肉",r:"とりにく"},{t:"は"},{t:"食",r:"た"},{t:"べませんが、"},{t:"魚",r:"さかな"},{t:"は"},{t:"大丈夫",r:"だいじょうぶ"},{t:"です"}] },
      { id:"f22", en:"May I sit here?", segs:[{t:"ここに"},{t:"座",r:"すわ"},{t:"ってもいいですか"}] },
      { id:"f23", en:"May I order now?", segs:[{t:"注文",r:"ちゅうもん"},{t:"してもいいですか"}] },
    ]
  },
  {
    id: "shopping", title: "Shopping", ja: "買い物", icon: "🛍️", accent: "#7F77DD",
    phrases: [
      { id:"s1", en:"How much is this?", segs:[{t:"いくらですか"}] },
      { id:"s2", en:"I'll take this", segs:[{t:"これをください"}] },
      { id:"s3", en:"Can I pay by card?", segs:[{t:"カードで"},{t:"払",r:"はら"},{t:"えますか"}] },
      { id:"s4", en:"Can I try this on?", segs:[{t:"試着",r:"しちゃく"},{t:"できますか"}] },
      { id:"s5", en:"Do you have a smaller size?", segs:[{t:"小",r:"ちい"},{t:"さいサイズはありますか"}] },
      { id:"s6", en:"Do you have a larger size?", segs:[{t:"大",r:"おお"},{t:"きいサイズはありますか"}] },
      { id:"s7", en:"Receipt please", segs:[{t:"領収書",r:"りょうしゅうしょ"},{t:"をください"}] },
      { id:"s8", en:"Can I get a discount?", segs:[{t:"割引",r:"わりびき"},{t:"できますか"}] },
      { id:"s9", en:"May I touch this?", segs:[{t:"触",r:"さわ"},{t:"ってもいいですか"}] },
      { id:"s10", en:"May I open it?", segs:[{t:"開",r:"あ"},{t:"けてもいいですか"}] },
    ]
  },
  {
    id: "greetings", title: "Greetings", ja: "挨拶", icon: "🙏", accent: "#3B6D11",
    phrases: [
      { id:"g1", en:"Nice to meet you", segs:[{t:"はじめまして"}] },
      { id:"g2", en:"Pleased to meet you", segs:[{t:"よろしく"},{t:"お願",r:"おねが"},{t:"いします"}] },
      { id:"g3", en:"Thank you very much", segs:[{t:"ありがとうございます"}] },
      { id:"g4", en:"Excuse me", segs:[{t:"すみません"}] },
      { id:"g5", en:"Good morning", segs:[{t:"おはようございます"}] },
      { id:"g6", en:"Hello / Good afternoon", segs:[{t:"こんにちは"}] },
      { id:"g7", en:"Good evening", segs:[{t:"こんばんは"}] },
      { id:"g8", en:"How are you?", segs:[{t:"お"},{t:"元気",r:"げんき"},{t:"ですか"}] },
      { id:"g9", en:"I'm sorry", segs:[{t:"ごめんなさい"}] },
      { id:"g10", en:"May I take a photo?", segs:[{t:"写真",r:"しゃしん"},{t:"を"},{t:"撮",r:"と"},{t:"ってもいいですか"}] },
      { id:"g11", en:"May I speak with you for a moment?", segs:[{t:"少",r:"すこ"},{t:"し"},{t:"話",r:"はな"},{t:"してもいいですか"}] },
      { id:"g12", en:"My name is [name]", segs:[{t:"私",r:"わたし"},{t:"の"},{t:"名前",r:"なまえ"},{t:"は〇〇です"}] },
      { id:"g13", en:"This is my wife [name]", segs:[{t:"こちらは"},{t:"妻",r:"つま"},{t:"の〇〇です"}] },
      { id:"g14", en:"We are from [country / city]", segs:[{t:"私",r:"わたし"},{t:"たちは〇〇から"},{t:"来",r:"き"},{t:"ました"}] },
    ]
  },
  {
    id: "hotel", title: "Hotel", ja: "ホテル", icon: "🏨", accent: "#0F6E56",
    phrases: [
      { id:"ho1", en:"I have a reservation", segs:[{t:"予約",r:"よやく"},{t:"があります"}] },
      { id:"ho2", en:"What time is checkout?", segs:[{t:"チェックアウトは"},{t:"何時",r:"なんじ"},{t:"ですか"}] },
      { id:"ho3", en:"Is Wi-Fi available?", segs:[{t:"Wi-Fiはありますか"}] },
      { id:"ho4", en:"Is breakfast included?", segs:[{t:"朝食",r:"ちょうしょく"},{t:"はついていますか"}] },
      { id:"ho5", en:"Can you store my luggage?", segs:[{t:"荷物",r:"にもつ"},{t:"を"},{t:"預",r:"あず"},{t:"かってもらえますか"}] },
      { id:"ho6", en:"Send luggage to the next hotel", segs:[{t:"荷物",r:"にもつ"},{t:"を"},{t:"次",r:"つぎ"},{t:"のホテルに"},{t:"送",r:"おく"},{t:"ってもらえますか"}] },
      { id:"ho7", en:"Send luggage by delivery service", segs:[{t:"宅配便",r:"たくはいびん"},{t:"で"},{t:"荷物",r:"にもつ"},{t:"を"},{t:"送",r:"おく"},{t:"りたいです"}] },
      { id:"ho8", en:"When will it arrive?", segs:[{t:"いつ"},{t:"届",r:"とど"},{t:"きますか"}] },
      { id:"ho9", en:"Please call a taxi", segs:[{t:"タクシーを"},{t:"呼",r:"よ"},{t:"んでもらえますか"}] },
      { id:"ho10", en:"I'd like to stay one more night", segs:[{t:"もう"},{t:"一泊",r:"いっぱく"},{t:"したいです"}] },
      { id:"ho11", en:"May I check in early?", segs:[{t:"早",r:"はや"},{t:"めにチェックインしてもいいですか"}] },
      { id:"ho12", en:"May I leave my luggage here?", segs:[{t:"荷物",r:"にもつ"},{t:"を"},{t:"ここに"},{t:"置",r:"お"},{t:"いてもいいですか"}] },
    ]
  }
];
