import React from "react";
import { getProviders, signIn } from "next-auth/react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

const SignInPage = ({ providers }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Sign in to Legacy Pro</h2>
        {Object.values(providers).map((provider) => (
          <div key={provider.name} className="mb-2">
            <Button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default SignInPage;
