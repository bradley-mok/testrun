import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { hp, wp } from '../helpers/dimensions';
import { useRouter } from "expo-router";

const steps = [
  { title: 'Welcome to AgriTech', description: 'Your smart farming companion' },
  { title: 'Track Your Crops', description: 'Easily monitor your farm activities' },
  { title: 'Get Started', description: 'Join thousands of farmers today' },
];

const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish && onFinish();
    }
  };

  return (
    <ScreenWrapper bg="#f0fdf4">
      <View style={styles.container}>
        {/* Step Content */}
        <OnboardingStep
          title={steps[step].title}
          description={steps[step].description}
        />

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                step === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next / Finish Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            step === steps.length - 1
              ? router.replace("./LoginPage")
              : nextStep()
          }
        >
          <Text style={styles.buttonText}>
            {step === steps.length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const OnboardingStep = ({ title, description }) => (
  <View style={styles.step}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  step: {
    marginBottom: hp(5),
    alignItems: 'center',
  },
  title: {
    fontSize: hp(3),
    fontWeight: '600',
    color: '#166534',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  description: {
    fontSize: hp(2),
    textAlign: 'center',
    color: '#374151',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: hp(4),
  },
  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#16a34a',
  },
  button: {
    backgroundColor: '#16a34a',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(20),
    borderRadius: wp(3),
  },
  buttonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '500',
  },
});

export default Onboarding;
