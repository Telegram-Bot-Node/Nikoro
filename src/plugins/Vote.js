const Plugin = require("../Plugin");

module.exports = class Vote extends Plugin {

    constructor(...args) {
        super(...args);

        if (!this.db.votes) {
            this.db.votes = {};
        }
    }

    static get plugin() {
        return {
            name: "Vote",
            description: "A simple vote plugin.",
            help: `\`/vote <option>\` to vote for an option
\`/clearvote\` to clear the current vote
\`/setvote <topic>\` to set the current topic for the vote
\`/getvote\` or \`/voteresults\` to get info and results about the current vote.`
        };
    }

    get commands() {
        return {
            vote: ({args, message}) => {
                const chatId = message.chat.id;
                if (args.length === 0) return "Syntax: `/vote <option>`";
                if (!this.db.votes[chatId]) return "There is no vote at this time.";

                this.db.votes[chatId].results[message.from.username] = args.join(" ");
                return "Your vote has been registered.";
            },
            clearvote: ({message}) => {
                delete this.db.votes[message.chat.id];
                return "Question cleared.";
            },
            setvote: ({args, message}) => {
                if (args.length === 0) return "Please specify a question.";
                const question = args.join(" ");

                // Note that previous results are automatically removed
                this.db.votes[message.chat.id] = {
                    text: question,
                    results: {}
                };

                return "Question set.";
            },
            getvote: ({message}) => {
                const chatId = message.chat.id;
                if (!this.db.votes[chatId]) return "There is no vote at this time.";

                const poll = this.db.votes[chatId];
                const totalVotes = Object.keys(poll.results).length;
                let response = `Question: ${poll.text}\n` +
                    `Vote count: ${totalVotes}\n\n`;

                const uniqueAnswers = new Set();
                for (const user in poll.results) {
                    if (!poll.results.hasOwnProperty(user)) continue;
                    uniqueAnswers.add(poll.results[user]);
                }

                // Map<Answer, Array<Users>>
                const answerToUsersMap = new Map();
                for (const answer of uniqueAnswers) {
                    const users = [];
                    // Which users voted for this answer?
                    for (const user in poll.results) {
                        if (!poll.results.hasOwnProperty(user)) continue;
                        if (poll.results[user] !== answer) continue;
                        users.push(user);
                    }
                    answerToUsersMap.set(answer, users);
                }

                // Sort the map (https://stackoverflow.com/a/31159284) by user array length
                const sortedMap = new Map([...answerToUsersMap.entries()]
                    .sort(([[answerA, usersA], [answerB, usersB]]) => usersA.length - usersB.length));

                sortedMap.forEach((users, answer) => {
                    const votes = users.length;
                    const percentage = (100 * votes / totalVotes).toFixed(2);
                    response += `${answer}: ${votes} votes (${percentage}%)\n` + users.join(", ") + "\n";
                });

                return response;
            }
        };
    }
};