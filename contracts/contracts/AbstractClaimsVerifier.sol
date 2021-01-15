//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.7.0;
import "./CredentialRegistry.sol";

contract AbstractClaimsVerifier {
 
  CredentialRegistry registry;

  struct EIP712Domain {
    string  name;
    string  version;
    uint256 chainId;
    address verifyingContract;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );

  bytes32 DOMAIN_SEPARATOR;  //0x454545

  constructor (
    string memory name,
    string memory version,
    uint256 chainId,
    address verifyingContract,
    address _registryAddress) public {
    DOMAIN_SEPARATOR = hashEIP712Domain(
      EIP712Domain({
        name: name,
        version: version,
        chainId: chainId,
        verifyingContract: verifyingContract
    }));
    registry = CredentialRegistry(_registryAddress);
  }

  function hashEIP712Domain(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
    return keccak256(
      abi.encode(
        EIP712DOMAIN_TYPEHASH,                   //0x8b73c3c69bb8f....39400f
        keccak256(bytes(eip712Domain.name)),     // EIP712Studies --> 0x1868adb299....643261
        keccak256(bytes(eip712Domain.version)),  // 1 --> 0xc89efdaa54c0f....8b8bc6
        eip712Domain.chainId,                    //648529
        eip712Domain.verifyingContract           //
    ));
  }

  function _register(address _issuer, address _subject, bytes32 _credentialHash, uint256 _from, uint256 _exp, bytes calldata signature) internal returns (bool){
    return registry.register(_issuer, _subject, _credentialHash, _from, _exp, signature);
  }

  function _registerSignature(bytes32 _credentialHash, address issuer, bytes calldata signature) internal returns (bool){
    return registry.registerSignature(_credentialHash, issuer, signature);  
  }

  function _valid(uint256 validFrom, uint256 validTo) internal view returns (bool) {
    return (validFrom <= block.timestamp) && (block.timestamp < validTo);
  }

  function _verifySigners(bytes32 _digest, address _issuer) internal view returns (uint8){
    return registry.getSigners(_digest, _issuer);
  }

  function _isSigner(bytes32 _digest, address _issuer, bytes memory _signature) internal view returns(bool){
    return registry.isSigner(_digest, _issuer, _signature);
  }

  function _verifyIssuer(bytes32 digest, address issuer, uint8 v, bytes32 r, bytes32 s) internal view returns (bool) {
    return  registry.validDiploma(issuer, ecrecover(digest, v, r, s));
  }

  function _exist(bytes32 digest, address issuer) internal view returns (bool){
    return registry.exist(digest, issuer);
  }

  function _verifyRevoked(bytes32 digest, address issuer) internal view returns (bool){
    return !registry.revoked(issuer, digest);
  }

  //TODO TEST DELETE
  /*function verifyIssuerTest(bytes32 digest, address issuer, uint8 v, bytes32 r, bytes32 s) public view returns (bool) {
    return !registry.revoked(issuer, digest) && registry.validDiploma(issuer, ecrecover(digest, v, r, s));
  }*/
}
