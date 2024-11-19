export class ChatMessage {
    sentBy: string;
    sentOn = new Date();
    text: string;

    constructor(sentBy: string, text: string) {
        if (!text.trim()) throw new Error('Empty messages are not allowed.');
        this.sentBy = sentBy;
        this.text = text;
    }

    toJSON() {
        return {
            sentBy: this.sentBy,
            sentOn: this.sentOn.toISOString(),
            text: this.text,
        };
    }
}
