package controllers

import java.util.Date

import akka.actor._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.mvc._

class Application extends Controller {

  def index = Action { implicit request =>
    Ok(views.html.index("WebSockets Test"))
  }

  def wstest = WebSocket.acceptWithActor[String, String] { request => out =>
    MessageOperator.props(out)
  }

}


object MessageOperator {

  val messageHub = Akka.system.actorOf(Props(new MessageHubActor(historySize = 100)))

  def props(out: ActorRef) = Props(new MessageOperator(out, messageHub))
}

case class JoinMessageHub(actorRef: ActorRef)

case class LeaveMessageHub(actorRef: ActorRef)

class MessageOperator(out: ActorRef, messageHub: ActorRef) extends Actor {

  override def preStart() = {
    messageHub ! JoinMessageHub(self)
  }

  override def postStop() = {
    messageHub ! LeaveMessageHub(self)
  }

  def receive = {
    case message: String =>
      messageHub ! MessageRecord(message, new Date)
    case MessageRecord(message, date) =>
      out ! s"[$date] $message"
    case s =>
      println("What is this sender? " +(sender(), s))
  }
}

case class MessageRecord(message: String, date: Date)

class MessageHubActor(historySize: Int) extends Actor {

  var operators = Set[ActorRef]()
  var history = Seq[MessageRecord]()

  def receive = {
    case JoinMessageHub(operator) =>
      if (!operators(operator)) {
        println("Joining operator: " + operator)
        operators = operators + operator
        history.foreach(m => operator ! m)
      }
    case LeaveMessageHub(operator) =>
      println("Leaving operator: " + operator)
      if (operators(operator)) {
        operators = operators - operator
      }
    case message: MessageRecord =>
      println("New message: " + message)
      operators.foreach(_ ! message)
      history = history :+ message
      history = history.takeRight(historySize)
    case s =>
      println(s)
  }

}

