const Plugin = require("../Plugin");

module.exports = class Vote extends Plugin {
    static get plugin() {
        return {
            name: "Vote",
            description: "A simple vote plugin.",
            help: `\`/vote <option>\` to vote for an option
\`/clearvote\` to clear the current vote
\`/setvote <topic>\` to set the current topic for the vote
\`/getvote\` or \`/voteresults\` to get info and results about the current vote.`,
        };
    }

    start() {
        if (!this.db.votes)
            this.db.votes = {};
    }

    onCommand({message, command, args}, reply) {
        const chatId = message.chat.id;
        switch (command) {
        case "vote": {
            if (args.length === 0)
                return reply({
                    type: "text",
                    text: "Syntax: `/vote <option>`"
                });
            if (!this.db.votes[chatId])
                return reply({
                    type: "text",
                    text: "There is no vote at this time."
                });

            this.db.votes[chatId].results[message.from.username] = args.join(" ");

            reply({
                type: "text",
                text: "Your vote has been registered."
            });
            return;
        }
        case "clearvote": {
            delete this.db.votes[chatId];
            reply({
                type: "text",
                text: "Question cleared."
            });
            return;
        }
        case "setvote": {
            if (args.length === 0)
                return reply({
                    type: "text",
                    text: "Please specify a question."
                });

            const question = args.join(" ");

            // Note that previous results are automatically removed
            this.db.votes[chatId] = {
                text: question,
                results: {}
            };

            reply({
                type: "text",
                text: "Question set."
            });
            return;
        }
        case "getvote": {
            if (!this.db.votes[chatId])
                return reply({
                    type: "text",
                    text: "There is no vote at this time."
                });

            const poll = this.db.votes[chatId];
            const totalVotes = Object.keys(poll.results).length;
            let response = `Question: ${poll.text}\n` +
                `Vote count: ${totalVotes}\n\n`;

            // Get an array like [{user: "foo", answer: "bar"}, ...]
            const arrayOfVotes = [];
            for (const user in poll.results) {
                if (!poll.results.hasOwnProperty(user)) continue;
                arrayOfVotes.push({
                    user,
                    answer: poll.results[user]
                });
            }

            // The key is the vote, the content is the array of users who voted.
            // Eg. {"bar": ["foo"]}
            const voteCounts = {};
            for (const vote of arrayOfVotes) {
                const answer = vote.answer;
                const user = vote.user;
                if (voteCounts[answer])
                    voteCounts[answer].push(user);
                else
                    voteCounts[answer] = [user];
            }

            // Make a string for each option, and then sort the options by vote count
            const voteStrings = [];
            for (const answer in voteCounts) {
                if (!voteCounts.hasOwnProperty(answer)) continue;
                const votes = voteCounts[answer];
                const percentage = (100 * votes.length / totalVotes).toFixed(2);
                voteStrings.push({
                    votes,
                    string: `${answer}: ${votes.length} votes (${percentage}%)\n` +
                        votes.join(", ")
                });
            }
            response += voteStrings
                .sort((a, b) => a.votes - b.votes)
                .map(tuple => tuple.string)
                .join("\n\n");

            reply({
                type: "text",
                text: response
            });
            return;
        }
        default:
            return;
        }
    }
};