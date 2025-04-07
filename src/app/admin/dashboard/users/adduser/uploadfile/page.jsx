import StepComponent from "@/components/stepComponent";

//style
import "./uploadFile.scss";
import UploadFileComponent from "@/components/uploadFileComponent";

export default function Page() {
  const steps = [
    `Click on drag & drop or choose file to initiate the upload process.`,
    `A file browser will open. Navigate to the location on your computer where the file is stored. Select the file you want to upload.`,
    `After selecting the file, click the "Upload" or "Open" button. The file will be transferred to the server.`,
    `The upload process may take some time, depending on the file size and your internet connection speed. Allow the upload to finish.`,
    `Review the uploaded file to ensure it's correct. Save your changes to finalize the upload.`,
    `Click to “Import” button to finish the process.`,
  ];

  return (
    <div className="uploadFile">
      <div className="steps">
        {steps.map((step, index) => {
          return <StepComponent text={step} number={index + 1} key={index} />;
        })}
      </div>
      <UploadFileComponent
        accept={
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        }
      />
    </div>
  );
}
