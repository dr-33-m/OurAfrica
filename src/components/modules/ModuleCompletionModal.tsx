import React, { useState } from "react";
import { Award, Download, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useProgress } from "../../hooks/useProgress";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { Module } from "../../types";
import {
  generateCertificate,
  saveCertificate,
} from "../../services/certificateService";

interface ModuleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  onContinue?: () => void;
}

const ModuleCompletionModal: React.FC<ModuleCompletionModalProps> = ({
  isOpen,
  onClose,
  module,
  onContinue,
}) => {
  const { user } = useAuth();
  const { generateCertificate: saveCertificateToStore } = useProgress();
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const handleGenerateCertificate = async () => {
    if (!user) return;

    setIsGeneratingCertificate(true);
    try {
      // Get auth headers
      const token = localStorage.getItem("token");
      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      // Generate certificate record in backend and get certificate code
      await saveCertificateToStore(user.id, module.id, authHeaders);

      // Generate the PDF certificate
      const certificateDataUrl = generateCertificate(user, module);

      // Download the certificate
      const fileName = `${module.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Certificate.pdf`;
      saveCertificate(certificateDataUrl, fileName);

      setCertificateGenerated(true);
    } catch (error) {
      console.error("Failed to generate certificate:", error);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleClose = () => {
    setCertificateGenerated(false);
    onClose();
  };

  const handleContinue = () => {
    handleClose();
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Module Completed"
    >
      <div className="text-center p-6">
        {/* Celebration Icon */}
        <div className="mx-auto w-20 h-20 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-6">
          <Award size={40} className="text-success-600 dark:text-success-400" />
        </div>

        {/* Congratulations Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🎉 Congratulations!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You have successfully completed the module:
        </p>

        {/* Module Title */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {module.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {module.content.lessons.length} lessons •{" "}
            {module.content.quizzes.length} quizzes
          </p>
        </div>

        {/* Certificate Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Get Your Certificate
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Download your certificate of completion to showcase your
            achievement.
          </p>

          {certificateGenerated ? (
            <div className="flex items-center justify-center text-success-600 dark:text-success-400 mb-4">
              <CheckCircle size={20} className="mr-2" />
              <span className="font-medium">
                Certificate downloaded successfully!
              </span>
            </div>
          ) : (
            <Button
              onClick={handleGenerateCertificate}
              isLoading={isGeneratingCertificate}
              leftIcon={<Download size={16} />}
              className="mb-4"
            >
              {isGeneratingCertificate
                ? "Generating..."
                : "Download Certificate"}
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {onContinue && (
            <Button onClick={handleContinue}>Continue Learning</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModuleCompletionModal;
