const canUsePort = (port: any): boolean => {
  return /^\d+$/.test(`${port}`);
};

export default canUsePort;
