# Dedko - work in progress
A mystical and old wise man who helps players during their adventures through beautiful worlds of Dungeons and Dragons.

## Commands
Divided in two groups of related commands: **Dungeons and Dragons** and **Utility**.

### Dungeons and dragons
**Command prefix:** '/'

**Commands directory:** '/src/commands/dnd'

#### /addxp
DM command only. It adds the specified amount of experience to the specified character.

#### /commands
Only command that every user should know because it displays overall information about commands. It tells the user how to call help on each command.

#### /longrest
Performs a long rest for the character. It checks whether the character has already done a long rest in the 24h period.

#### /roll
Rolls a dices in the specified domain language. Supports addition and subtraction.

#### /rollAbilityCheck
Rolls an ability check using characters ability scores and modifiers, proficiency bonuses, expertise bonuses. There is an option to throw ability check with or without advantage or disadvantage and also add some bonus to the roll.

#### /rollSavingThrow
Rolls a saving throw using characters ability scores and modifiers, proficiency bonuses. There is an option to throw the saving throw with or without advantage or disadvantage and also add some bonus to the roll.

#### /sheet
Displays a players character sheet using formatted embed message.

#### /time
Displays current date, time and location of the character. Additionally it shows when had the character lastly done a long rest.

### Utility
**Command prefix:** '!'

**Commands directory:** '/src/commands/utility'

#### !restart
The bot is able to restart automatically whenever error occurs. But you can do it also manually using this command.
