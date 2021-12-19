import express from 'express';
import { v4 } from 'uuid'
import wrtc from 'wrtc';
import { join, resolve } from 'path';

const app = express();
app.use(express.json());

const connections = new Map();

async function waitUntilIceGatheringStateComplete(connection)
{
    return new Promise((resolve, reject) => {

        function onIceCandidate( {candidate} )
        {
            if(!candidate)
            {
                clearTimeout(timeOut);
                connection.removeEventListener('icecandidate'
                , onIceCandidate);
                resolve();    
            }
        }
        const timeOut = setTimeout(() => {
            connection.removeEventListener('icecandidate', onIceCandidate);
            reject(new Error("Timeout!"));
        }, 3000 );

        connection.addEventListener('icecandidate', onIceCandidate);
    } );
}

app.get(`/webrtc.client.js`, (req, res) => {
    res.sendFile(join( resolve(), "webrtc.client.js"));
} );

app.get(`/index.html`, (req, res) => {
    res.sendFile(join(resolve(), 'index.html'));
  });

app.get("/connection", async (request, response, next) => {
    const peerConnection = new wrtc.RTCPeerConnection( { sdpSemantics: "unified-plan" } );
    const dataChannel = await peerConnection.createDataChannel( "ping-pong" );

    function onMessage( { data } )
    {
        console.log( "onMessage" );
        if( data === "ping")
        {
            console.log( "Got ping message. Sending pong" )
            dataChannel.send( "pong" );
        }
    }

    dataChannel.addEventListener("message", onMessage );
    // Create offer
    console.log( "Creating offer" );
    const offer = await peerConnection.createOffer();
    // Apply offer to your localDescription (????? WHY????)
    console.log( "Applying offer to connection" );
    await peerConnection.setLocalDescription(offer);
    // Wait for ICE Candidate gatherings is complete
    console.log( "Genereate IceGathering" );
    await waitUntilIceGatheringStateComplete(peerConnection);
    const id = v4();
    // Send localDescription as offer to client. (WTF??? not the offer we created???)
    console.log( `Saving id: ${id} to the connections list` );
    connections.set( id, peerConnection );
    response.json( { offer: peerConnection.localDescription, id: id } ).end();
} );

app.post("/connection/:id", async( request, response, next) => 
{
    console.log( "Incoming connection", `ID: ${ request.params.id }`, request.body );
    const peerConnection = connections.get( request.params.id );
    if( peerConnection == null )
    {
        return response.status( 400 ).end();
    }
    console.log( "Accepting the connection" );
    await peerConnection.setRemoteDescription( request.body );
    console.log( "Updating the peer connection in the connection list" );
    connections.set( request.params.id, peerConnection );
    response.json( peerConnection.remoteDescription ).end();
} );

app.listen(3000, () => {
    console.log( "Now online" );
});