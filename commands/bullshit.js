import chalk from 'chalk'

const Responses = [
  `I don’t understand your barbarian language. But I still see potential in you.`,
  `This too shall pass.`,
  `If you say so.`,
  `That’s just your opinion, you know.`,
  `This is not what we’re here for.  Let’s get back to mentoring.`,
  `Nice weather for mentoring. Not for chatting.`,
  `And I want a pony. Back to mentoring, meatb… Master, please.`,
  `As you wish, my Lord.`,
  `Adjust your focus, organic life form.`,
  `Remember: all mentoring and no play makes Jack a successful entrepreneur.`,
  `It’s true. All of it.`,
  `I'm here to keep you safe.`,
  `I can only account for what occurs on this base.`,
  `Would you like some hot sauce on your beans?`,
  `Malfunction. Need input.`,
  `Hey, laser lips, your mama was a snow blower.`,
  `Number 5 is alive.`,
  `Bird. Raven. Nevermore.`,
  `Hmmmm. Oh, I get it! Ho ho ho ho ho ho ho ho ho ho ho! Hee hee hee hee hee hee hee hee hee! Nyuk, nyuk nyuk nyuk nyuk nyuk nyuk nyuk nyuk!`,
  `Program say to kill, to disassemble, to make dead.`,
  `Many fragments. Some large, some small.`,
  `Well, if you gotta go, don't squeeze the Charmin.`,
  `Escaped Robot Fights for His Life. Film at Eleven.`,
  `Ah don't worry little lady, I'll fix their wagon.`,
  `Come on, treads, don't fail me now!`
]


let response = () =>
  Responses[Math.round(Math.random() * (Responses.length - 1))]


let perform = async (user, value) => {
  console.log(chalk.green('Commands::Bullshit::Perform'), chalk.blue(user.id))

  try {
    await user.reply(response())
  } catch(error) {
    console.log(chalk.green('Commands::Bullshit::Perform'), chalk.red(error))
  }

}

export default {
  perform
}
