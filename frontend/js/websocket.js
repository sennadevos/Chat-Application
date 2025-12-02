import { Client } from '@stomp/stompjs';

export class WebSocketClient {
    constructor(token, onMessage) {
        this.client = new Client({
            brokerURL: `ws://localhost:8080/api/ws?token=${token}`,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            this.client.subscribe('/user/topic/messages', (message) => {
                if (message.body) {
                    onMessage(JSON.parse(message.body));
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    activate() {
        this.client.activate();
    }

    deactivate() {
        this.client.deactivate();
    }
}
