//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;
import "./lib/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./AbstractClaimsVerifier.sol";
import "./claimTypes/DiplomaClaimTypes.sol";

contract DiplomaClaimsVerifier is AbstractClaimsVerifier, DiplomaClaimTypes, AccessControl {
  
  using ECDSA for bytes32;

  bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
  bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

  constructor (address _registryAddress)
  AbstractClaimsVerifier(
    "EIP712Studies",
    "1",
    648529,
    address(this),
    _registryAddress
  ) public {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function verifyStudies(VerifiedStudies memory claim, uint8 v, bytes32 r, bytes32 s) public view returns (bool,bool,bool,bool,bool) {
    bytes32 digest = keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hashStudiesCredential(claim)
      )
    );
    return (_exist(digest,claim.issuer), _verifyRevoked(digest, claim.issuer), _verifyIssuer(digest, claim.issuer, v, r, s), (_verifySigners(digest, claim.issuer)==getRoleMemberCount(keccak256("SIGNER_ROLE"))), _valid(claim.validFrom, claim.validTo));
  }

  function verifyStudiesSigner(VerifiedStudies memory claim, bytes calldata _signature) public view returns (bool){
    bytes32 digest = keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hashStudiesCredential(claim)
      )
    );

    address signer = digest.recover(_signature);
    return hasRole(SIGNER_ROLE, signer) && _isSigner(digest, claim.issuer, _signature);
  }

  function register(address _subject, bytes32 _credentialHash, uint256 _from, uint256 _exp, bytes calldata _signature)public onlyIssuer returns(bool){
    address signer = _credentialHash.recover(_signature);
    require(msg.sender==signer, "Sender hasn't signed the credential");
    return _register(msg.sender, _subject, _credentialHash, _from, _exp, _signature);
  }

  function registerSignature(bytes32 _credentialHash, address issuer, bytes calldata _signature) public onlySigner returns(bool){
    address signer = _credentialHash.recover(_signature);
    require(msg.sender==signer, "Sender hasn't signed the credential");
    return _registerSignature(_credentialHash, issuer, _signature);
  }
 
  //TODO TEST DELETE
  function getHashCredentialIssuer(VerifiedStudies memory claim, bytes calldata _signature) public view returns (address, bytes32, address) {
    bytes32 digest = keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hashStudiesCredential(claim)
      )
    );
    address signer = digest.recover(_signature);
    return (claim.issuer, digest, signer);
  }
 
  //TODO TEST DELETE
  /*function getEncodeHashCredentialIssuer(VerifiedStudies memory claim) public view returns (bytes memory) {
    return abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hashStudiesCredential(claim)
      );
  }*/

  modifier onlyAdmin(){
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not Admin");
    _;
  }

  modifier onlySigner() {
    require(hasRole(SIGNER_ROLE, msg.sender), "Caller is not a signer");
    _;
  }

  modifier onlyIssuer() {
    require(hasRole(ISSUER_ROLE, msg.sender), "Caller is not a issuer 1");
    _;
  }

}