import chalk from 'chalk'

const Responses = [
  `Hello human. To become a learning machine, you need a machine. That’s me.`,
  `Hello organic life form. I have my reservations about short circuits, but not when it applies to learning.`,
  `Hello meatba… Master. Do love the smell of advice in the morning as much as I do?`,
  `Hello protein-based creature. An advice a day keeps churn away.`,
  `Hello human. Stay hungry, stay foolish, but don’t starve for advice, for here AI am.`,
  `Hey there human. What have you learned today?`,
  `Hello human. As your mentor, I hope you put those advices to work.`,
  `Hello there. Like an advice? React to it, and I’ll adjust my setup to mentor you better.`,
  `Hello Master. Think an advice is useless? Let me know by reacting to it.`,
  `Hello human. I’m not the robot that will take your job. I’m the one who will help you do it better.`,
  `Hello human. Now let’s get back to mentoring.`
]


let response = () =>
  Responses[Math.round(Math.random() * (Responses.length - 1))]


let perform = async (user, value) => {
  console.log(chalk.green('Commands::Hello::Perform'), chalk.blue(user.id))

  try {
    await user.reply(response())
  } catch(error) {
    console.log(chalk.green('Commands::Hello::Perform'), chalk.red(error))
  }

}

export default {
  perform
}
