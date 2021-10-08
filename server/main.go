package main
import (
    "net/http"
	 
	"fmt"
	"github.com/gempir/go-twitch-irc/v2"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"errors"
	"github.com/gorilla/websocket"
	"log"
)
 
 
type chatMessage struct {
	Message string `json:"message"`
}

 


type conversation struct {
	User string `json:"user"` 
	Message string  `json:"message"` 
	Movement string `json:"move"` 
	Emotion string  `json:"emotion"` 

}

type GameData struct {
	UserName string `json:"user"` 
	Message string  `json:"message"` 

}



// Listen to a connection Type
type Message struct {
	Message string `json:"message"`
 }

 // Message to Client
 type ClientMessage struct {
	 Verbal string 
	 Emotion string
	 Movement string
	 
 }

 // Commands game
 type GameCommands struct {
	TwitchCommand string 
	GameAction string
}


//Upgrade an incoming HTTP connection
var upgrader = websocket.Upgrader{}

var gameCommands = []GameCommands{
	{TwitchCommand: "!blueDefender", GameAction: "Blue"},
	{TwitchCommand: "!pinkDefender", GameAction: "Pink"},
	{TwitchCommand: "!menu", GameAction: "menu"},
	{TwitchCommand: "!closeMenu", GameAction: "closeMenu"},
	{TwitchCommand: "!get20", GameAction: "get20"},
	{TwitchCommand: "!get30", GameAction: "get30"},
	{TwitchCommand: "!get40", GameAction: "get40"},
	{TwitchCommand: "!position:a1", GameAction: "a1"},
	{TwitchCommand: "!position:a2", GameAction: "a2"},
	{TwitchCommand: "!position:a3", GameAction: "a3"},
	{TwitchCommand: "!position:a4", GameAction: "a4"},
	{TwitchCommand: "!position:a5", GameAction: "a5"},
	{TwitchCommand: "!position:b1", GameAction: "b1"},
	{TwitchCommand: "!position:b2", GameAction: "b2"},
	{TwitchCommand: "!position:b3", GameAction: "b3"},
	{TwitchCommand: "!position:b4", GameAction: "b4"},
	{TwitchCommand: "!position:b5", GameAction: "b5"},
	{TwitchCommand: "!position:c1", GameAction: "c1"},
	{TwitchCommand: "!position:c2", GameAction: "c2"},
	{TwitchCommand: "!position:c3", GameAction: "c3"},
	{TwitchCommand: "!position:c4", GameAction: "c4"},
	{TwitchCommand: "!position:c5", GameAction: "c5"},
	{TwitchCommand: "!position:d1", GameAction: "d1"},
	{TwitchCommand: "!position:d2", GameAction: "d2"},
	{TwitchCommand: "!position:d3", GameAction: "d3"},
	{TwitchCommand: "!position:d4", GameAction: "d4"},
	{TwitchCommand: "!position:d5", GameAction: "d5"},
	{TwitchCommand: "!position:e1", GameAction: "e1"},
	{TwitchCommand: "!position:e2", GameAction: "e2"},
	{TwitchCommand: "!position:e3", GameAction: "e3"},
	{TwitchCommand: "!position:e4", GameAction: "e4"},
	{TwitchCommand: "!position:e5", GameAction: "e5"},
	{TwitchCommand: "!position:f1", GameAction: "f1"},
	{TwitchCommand: "!position:f2", GameAction: "f2"},
	{TwitchCommand: "!position:f3", GameAction: "f3"},
	{TwitchCommand: "!position:f4", GameAction: "f4"},
	{TwitchCommand: "!position:f5", GameAction: "f5"},

}

var chatArr = []conversation{
	{User: "hi miku how are you?", Message: "I am fine  thanks", Movement: "rise_right_hand", Emotion: "happy" },
	{User: "miku what you did interesting this week?",
	Message: "This week,  I was helping Lucas to learn Golang" , Movement: "", Emotion: "happy"},
	{User: "wow Amazing and what you two build together?", Message: "We build this chat for you",
	Movement: "left_hand", Emotion: "happy",
},
	{User: "btw what will be the horoscope for Taurus tomorrow?", 
	Message: "One thing is clear your future looks promising!",
	Movement: "surprise", Emotion: "happy",
},
	{User: "hello Miku", Message: "Hi, nice to see you!", Movement: "rise_right_hand", Emotion: "happy"},
	{User: "hello", Message: "Hi, nice to see you!", Movement: "rise_right_hand", Emotion: "happy"},
	{User: "bye Miku", Message: "are you already going?", Movement: "surprise", Emotion: "happy"},
}




 

func sendMikuAnswer(message string) (conversation)  {
	var mikuAnswer conversation
	for i:= 0; i< len(chatArr); i++{
		if message == chatArr[i].User {
			mikuAnswer.Message = chatArr[i].Message
			mikuAnswer.Movement = chatArr[i].Movement
			mikuAnswer.Emotion = chatArr[i].Emotion
		}
	}
	return mikuAnswer

	
   }

func sendGameCommands(message string) (string){
	 
	var chosenCommand string
	for i:= 0; i< len(gameCommands) ; i++ {
		if message == gameCommands[i].TwitchCommand {
			fmt.Println("Game Command", gameCommands[i].GameAction)
			chosenCommand = gameCommands[i].GameAction
			
		}
	}
	
	return chosenCommand



}

   
 
func main(){
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	
	// Get and save NLG response
	var verbal,movement,emotion string
 
	// Get and save NLG response
	var gameResponse,userName string
	var answerToChat conversation
	 
	
	// make the connection to twitch tv
   client := twitch.NewClient("testautomationd", "oauth:txlo17ss7lal2cilz2dk3hft0ueyi9")
   log.Println("twitch Connected!" )
  go client.OnPrivateMessage(func(message twitch.PrivateMessage) {
	// Miku answer
	answerToChat = sendMikuAnswer(message.Message)

	// game command
	gameResponse = sendGameCommands(message.Message)
	userName = message.User.Name
	
   })
   log.Println("Tiwtch Joined Connected!")	  
   client.Join("testautomationd")
  go client.Connect()
   // Open websocket connection to client
	go e.GET("/ws", func(c echo.Context) error {

		//upgrade the HTTP connection in the handler:
			upgrader.CheckOrigin = func(r *http.Request) bool { return true }
		
			ws, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
			if !errors.Is(err, nil) {
				log.Println(err)
			}
			defer ws.Close()
		
			log.Println("Connected!")
		 
			 
			// Listen and handle with Client Connection
			for {
				var message Message
				err := ws.ReadJSON(&message)
				if !errors.Is(err, nil) {
					log.Printf("error occurred: %v", err)
					break
				}
				log.Println(message)
	
				 // send message from server
				 if gameResponse != "" {
					var gameData = GameData{UserName: userName, Message:gameResponse} 
					ws.WriteJSON(gameData)
				 } 

				 if answerToChat.Message != ""{
					ws.WriteJSON(answerToChat)
				 }
				 gameResponse = ""
				 userName = ""
				 answerToChat.Message = ""
				 answerToChat.Emotion = ""
				 answerToChat.Movement = ""
			}
	
			 
				
			
			 
			
			
		
			return nil
		})
		log.Println("Websocket Connected!" , verbal,movement,emotion)	
		e.Logger.Fatal(e.Start(":8080"))
   		
   
		 
  
   
	
}
 
 
