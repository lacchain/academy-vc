//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

contract DiplomaClaimTypes {

  struct VerifiedStudies {
    address issuer; //Lacchain Academy
    address subject;
    bytes32 diploma; //CredentialSubject
    uint256 validFrom;
    uint256 validTo;
  }

  bytes32 constant internal VERIFIED_STUDIES_TYPEHASH = keccak256(
    "VerifiedStudies(address issuer,address subject,bytes32 diploma,uint256 validFrom,uint256 validTo)"
  );

  function hashStudiesCredential(VerifiedStudies memory claim) internal pure returns (bytes32) {    //0xAABBCC11223344....556677
    return keccak256(
      abi.encode(
        VERIFIED_STUDIES_TYPEHASH,  //0x914c1e1b0922....2c3a98
        claim.issuer,               //0x41B1942A86....3EFA12
        claim.subject,              //0x6715E33aA6....50B558
        claim.diploma,              //0x.......
        claim.validFrom,            //123456
        claim.validTo               //123700
      )
    );
  }
 
  //TODO TEST DELETE
  /*function getHashStudiesCredential(VerifiedStudies calldata claim) external pure returns (bytes32) {    //0xAABBCC11223344....556677
    return keccak256(
      abi.encode(
        VERIFIED_STUDIES_TYPEHASH,  //0x914c1e1b0922....2c3a98
        claim.issuer,               //0x41B1942A86....3EFA12
        claim.subject,              //0x6715E33aA6....50B558
        claim.diploma,              //0x.......
        claim.validFrom,            //123456
        claim.validTo               //123700
      )
    );
  }*/
}