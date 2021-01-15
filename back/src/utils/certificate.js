import fs from 'fs';
import path from 'path';
import pdf from "html-pdf";

export function getCertificate( subject ) {
	const background = fs.readFileSync( path.resolve( './utils/emails/assets/background.jpg' ) );
	return new Promise( async ( resolve, reject ) => {
		pdf.create(
			`<html>
			<style>
				.name {
					padding: 10px;
					font-size: 55px;
					font-weight: 400;
					color: #000;
					position: absolute;
					top: 570px;
					left: 0;
					width: 2000px;
					text-align: center;
					text-transform: uppercase;
					z-index: 1000;
				}
			</style>
				<body>
					<img src="data:image/png;base64,${background.toString( 'base64' )}" alt="background" />					
					<div class="name">${subject.givenName} ${subject.familyName}</div>
				</body>
			</html>`, {
				width: "2010px",
				height: "1434px",
				border: {
					top: "0",
					right: "0",
					bottom: "0",
					left: "0"
				},
			} ).toBuffer( ( error, buffer ) => {
			if( error ) return reject( error );
			resolve( buffer.toString( 'base64' ) );
		} );
	} );

}
