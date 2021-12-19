let dataChannel  = null;
let interval = null;

function onMessage({ data }) {
    console.log( "Incoming Data");
    if (data === 'pong') {
      console.log('Received a pong message');
    }
  }

function onDataChannel({ channel }) {
  if (channel.label !== 'ping-pong') {
      console.log( "Not a ping-pong channel");
    return;
  }

  dataChannel = channel;
  dataChannel.addEventListener('message', onMessage);
  console.log( "Sending a ping message" );
  dataChannel.send('ping');

}

async function createConnectio()
{
    console.log( "Creating connection" );
    const response = await fetch("connection").then( response => response.json());
    console.log("Got response!", "Setting remote description" );

    const localPeerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan'
    });

    await localPeerConnection.setRemoteDescription( response.offer );

    console.log( "Add event listener to the datachannel" );
    localPeerConnection.addEventListener('datachannel', onDataChannel);

    console.log( "Create an answer to the server!" );
    const answer = await localPeerConnection.createAnswer();

    console.log( "Setting up localDescription");
    await localPeerConnection.setLocalDescription(answer);
    
    fetch( `connection/${response.id}`,
    { 
        method: "POST", 
        body: JSON.stringify( localPeerConnection.localDescription ), 
        headers: { 'Content-Type': 'application/json'}
    });

    setTimeout(() => {
        console.log( "Connection state after 2 seconds" );
        console.log( "Normal connectionState ?", localPeerConnection.connectionState );
        console.log( "iceConnectionState ?", localPeerConnection.iceConnectionState );
    }, 2000)
}

createConnectio();